import { Client as PlayerClient, ServerClient } from 'minecraft-protocol';
import { EventEmitter } from 'node:events';
import * as structuredClone from 'structured-clone';
import TypedEmitter from 'typed-emitter';
import { PacketsPlayToClient, PacketsPlayToServer } from '../PacketTypings';
import { ValueOf } from '../Types';
import Player from './Player';

export type PlayerProxyHandlerEvents = {
  start: (toClient: ServerClient, toServer: PlayerClient) => void;
  end: (username: string, log: boolean) => void;

  fromServer: (
    packet: ValueOf<{
      [T in keyof PacketsPlayToClient]: {
        name: T;
        data: PacketsPlayToClient[T];
      };
    }>,
    toClient: ServerClient,
    toServer: PlayerClient
  ) => void | Promise<void> | boolean;
  fromClient: (
    packet: ValueOf<{
      [T in keyof PacketsPlayToServer]: {
        name: T;
        data: PacketsPlayToServer[T];
      };
    }>,
    toClient: ServerClient,
    toServer: PlayerClient
  ) => void | Promise<void> | boolean;
};

export default class PlayerProxyHandler extends (EventEmitter as new () => TypedEmitter<PlayerProxyHandlerEvents>) {
  public readonly player: Player;

  constructor(player: Player) {
    super();
    this.player = player;
  }

  public setupListeners() {
    this.player.proxy.removeAllListeners();

    this.player.proxy.on('incoming', async (data, meta, toClient, toServer) => {
      let send = true;

      const msg = structuredClone(data);

      const listeners = this.listeners('fromServer');

      // TODO: Fix async support, caused lag spikes even on empty async functions
      for (const func of listeners) {
        const result = func(
          {
            data,
            name: meta.name as any,
          },
          toClient,
          toServer
        );
        if (result === false) send = false;
      }

      if (send) toClient.write(meta.name as any, msg);
    });

    this.player.proxy.on('outgoing', async (data, meta, toClient, toServer) => {
      // Custom inventories
      if (meta.name === 'window_click' && data.windowId === 255) return;

      let send = true;

      const msg = structuredClone(data);

      const listeners = this.listeners('fromClient');

      // TODO: Fix async support, caused lag spikes even on empty async functions
      for (const func of listeners) {
        const result = func(
          {
            data,
            name: meta.name as any,
          },
          toClient,
          toServer
        );
        if (result === false) send = false;
      }

      if (send) toServer.write(meta.name as any, msg);
    });

    this.player.proxy.on('start', (...args) => this.emit('start', ...args));
    this.player.proxy.on('end', (username) => this.emit('end', username, true));
  }
}
