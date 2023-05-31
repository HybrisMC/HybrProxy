import { EventEmitter } from 'node:events';
import TypedEmitter from 'typed-emitter';
import { Direction, ListenerEvents, Location } from '../Types';
import PlayerProxyHandler from '../player/PlayerProxyHandler';
import Logger from './Logger';

export function parseLocation(data: Location) {
  return {
    x: data.x / 32,
    y: data.y / 32,
    z: data.z / 32,
  };
}
export function parseDirection(data: Direction) {
  while (data.pitch > 90) data.pitch -= 360;
  while (data.pitch < -90) data.pitch += 360;

  while (data.yaw > 360) data.yaw -= 360;
  while (data.yaw < 0) data.yaw += 360;

  return {
    yaw: data.yaw,
    pitch: data.pitch,
  };
}

export default class Listener extends (EventEmitter as new () => TypedEmitter<ListenerEvents>) {
  public constructor(proxyHandler: PlayerProxyHandler) {
    super();
    proxyHandler.on('start', (toClient, toServer) =>
      this.emit('switch_server', toServer)
    );

    proxyHandler.on('fromServer', async ({ name, data }) => {
      // Chat packet
      if (name === 'chat') {
        try {
          // Server Full
          // Triggered when a message like "has joined (X/X)!"
          if (
            data.message.startsWith(
              '{"italic":false,"extra":[{"color":"yellow","text":""}'
            ) &&
            data.message.endsWith(
              '"},{"text":""},{"bold":false,"italic":false,"underlined":false,"obfuscated":false,"strikethrough":false,"text":""},{"color":"yellow","text":")!"},{"color":"yellow","text":""}],"text":""}'
            )
          ) {
            const message: string = JSON.parse(data.message)
              .extra.map((element) => element.text)
              .join('');
            if (message.match(/\(([0-99]*)\/\1\)/g)) {
              const string = message
                .match(/\(([0-99]*)\/\1\)/g)[0]
                .replace(/\D/g, '');
              const maxPlayers = parseInt(
                string.substring(0, string.length / 2)
              );
              await new Promise((resolve) => setTimeout(resolve, 250));
              this.emit('server_full', maxPlayers);
            }
          }
        } catch (error) {
          Logger.error("Couldn't parse chat packet", error);
        }
      }

      if (name === 'named_entity_spawn') {
        this.emit(
          'player_spawn',
          data.playerUUID,
          data.entityId,
          parseLocation(data)
        );
      }

      if (name === 'player_info' && data.action === 0) {
        for (const player of data.data.filter((i) => i.UUID && i.name))
          this.emit('player_join', player.UUID, player.name);
      }

      if (name === 'scoreboard_team') {
        switch (data.mode) {
          case 0:
            this.emit('team_create', data.team);
            break;
          case 1:
            this.emit('team_delete', data.team);
            break;
          case 2:
            this.emit('team_edit', data);
            break;
          case 3:
            this.emit('team_player_add', data.team, data.players);
          default:
            break;
        }
      }

      if (name === 'chat' && data.position == 2) {
        this.emit('action_bar', JSON.parse(data.message));
      }

      if (name === 'title' && data.action === 2) {
        this.emit(
          'title',
          data.action,
          data.text,
          data.fadeIn,
          data.stay,
          data.fadeOut
        );
      }

      if (name === 'entity_destroy')
        for (const id of data.entityIds) this.emit('player_leave', id);

      if (name === 'entity_teleport') {
        this.emit('entity_teleport', data.entityId, parseLocation(data));
      }
      if (name === 'rel_entity_move' || name === 'entity_move_look') {
        this.emit(
          'entity_move',
          data.entityId,
          parseLocation({
            x: data.dX,
            y: data.dY,
            z: data.dZ,
          })
        );
      }

      if (name === 'entity_velocity') {
        this.emit(
          'entity_velocity',
          data.entityId,
          parseLocation({
            x: data.velocityX,
            y: data.velocityY,
            z: data.velocityZ,
          })
        );
      }

      if (name === 'position') {
        this.emit('client_move', {
          x: data.x,
          y: data.y,
          z: data.z,
        });
        if (data.yaw && data.pitch)
          this.emit('client_face', parseDirection(data), {
            yaw: data.yaw,
            pitch: data.pitch,
          });
      }
    });

    proxyHandler.on('fromClient', ({ name, data }) => {
      if (name === 'position' || name === 'position_look') {
        this.emit('client_move', {
          x: data.x,
          y: data.y,
          z: data.z,
        });
      }
      if (name === 'look' || name === 'position_look') {
        this.emit('client_face', parseDirection(data), {
          yaw: data.yaw,
          pitch: data.pitch,
        });
      }
    });
  }
}
