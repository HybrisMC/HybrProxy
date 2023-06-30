import { Game } from 'hypixel-api-reborn';
import { MicrosoftDeviceAuthorizationResponse } from 'minecraft-protocol';
import { exec } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { createServer, IncomingMessage } from 'node:http';
import { join } from 'node:path';
import { WebSocket, WebSocketServer } from 'ws';
import { config, dashboard, player } from '.';
import Logger from './Classes/Logger';
import { updateActivity } from './player/modules/discordRichPresence';
import { Config, ModuleSettings, ModuleSettingsSchema } from './Types';
import {
  getConfigAsync,
  isValidModuleSettings,
  setValue,
} from './utils/config';
import { PluginInfo } from './utils/plugins';

const logger = new Logger('Dashboard');

const httpServer = createServer();

export default function () {
  const wss = new WebSocketServer({
    server: httpServer,
  });

  const dashboard = new DashboardManager(wss);

  return dashboard;
}

export class DashboardManager {
  public server: WebSocketServer;

  public socket: WebSocket = null;

  constructor(server: WebSocketServer) {
    this.server = server;

    this.server.on('error', (err) => logger.error('[Server Error]', err));

    this.server.on('connection', (socket, request) =>
      this.initSocket(socket, request)
    );

    (async () => {
      const config = await getConfigAsync();

      if (!config.dashboard.enabled) return;

      this.server.on('listening', () =>
        logger.info(`Dashboard WebSocket Online at Port 16055`)
      );

      httpServer.listen(16055);

      await new Promise((res) => setTimeout(res, 3000));

      const dist = join(process.cwd(), 'dashboard/dist');

      let command;
      switch (process.platform) {
        case 'darwin': {
          const product = join(
            dist,
            (await readdir(dist)).find((i) => i.startsWith('mac'))
          );
          const file = join(
            product,
            (await readdir(product)).find((i) => i.endsWith('.app'))
          );

          command = `open "${file}"`;
          break;
        }
        case 'win32': {
          const file = join(
            dist,
            (await readdir(dist)).find((i) => i.endsWith('.exe'))
          ).replace(/\//g, '\\');

          command = `"${file}"`;
          break;
        }
        case 'linux': {
          const file = (await readdir(dist)).find((i) =>
            i.endsWith('.AppImage')
          );

          command = `cd "${dist}" && chmod +x "./${file}" && "./${file}"`;
          break;
        }
        default:
          return logger.error(
            `Dashboard is not allowed on this operating system (${process.platform})`
          );
      }

      if (!this.socket)
        exec(
          // `npx electron "${join(process.cwd(), 'dashboard/dist/bundled')}"`,
          command,
          (err, out) => {
            if (err) logger.error('[Dashboard Error]', err);
          }
        );
    })();
  }

  public async initSocket(socket: WebSocket, request: IncomingMessage) {
    if (this.socket) return socket.close(4000);
    this.socket = socket;

    this.socket.on('error', (err) => logger.error('[WebSocket Error]', err));
    this.socket.on('close', () => (this.socket = null));
    this.socket.on('message', async (raw) => {
      let msg: {
        op: keyof IncomingDashboardEvents;
        data: any;
      };
      try {
        msg = JSON.parse(raw as unknown as string);
      } catch (err) {
        logger.error('Error Parsing Dashboard WS Message', raw, err);
      }
      const data = msg.data;

      switch (msg.op) {
        case 'kill':
          this.socket.close();
          process.exit(0);
          break;
        case 'reloadConfig':
          await getConfigAsync();
          break;
        case 'toggleModule':
          if (player.modules.find((i) => i.name == data.name)) {
            const module = player.modules.find((i) => i.name == data.name);
            const newConfig = { ...config.modules };
            newConfig[module.configKey] = data.enabled;
            await setValue('modules', newConfig);
            module.onConfigChange(data.enabled);
            module.toggleEnabled(data.enabled);
          }
          break;
        case 'updateSettings':
          if (player.modules.find((i) => i.configKey == data.moduleKey)) {
            const module = player.modules.find(
              (i) => i.configKey == data.moduleKey
            );

            const settings = data.settings;
            if (!isValidModuleSettings(settings, module.settingsSchema))
              return updateMeta();

            const config = await getConfigAsync();
            const newConfig = { ...config.settings };
            newConfig[module.configKey] = settings;
            await setValue('settings', newConfig);

            module.settings = settings;
            module.onSettingsChange?.(settings);

            updateMeta();
          }
          break;
      }
    });

    this.emit('metadata', {
      startedAt: Date.now() - Math.floor(process.uptime() * 1000),
      config: await getConfigAsync(),
      plugins: player.plugins,
      modules: player.modules.map((m) => ({
        name: m.name,
        description: m.description,
        enabled: m.enabled,
        createdBy: m.createdBy,
        key: m.configKey,
      })),
      crashedModules: player.crashedModules.map((m) => ({
        name: m.name,
        description: m.description,
        enabled: m.enabled,
        createdBy: m.createdBy,
        key: m.configKey,
      })),
      player: getDashboardPlayer(),
      settings: player.settings,
      settingsSchemas: player.settingsSchemas,
    });
  }

  public emit<T extends keyof OutgoingDashboardEvents>(
    op: T,
    data: OutgoingDashboardEvents[T]
  ): Promise<void> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return null;
    return new Promise((res, rej) => {
      this.socket.send(
        JSON.stringify({
          op,
          data,
        }),
        (err) => (err ? rej(err) : res())
      );
    });
  }
}

export type OutgoingDashboardEvents = {
  metadata: {
    startedAt: number;
    config: Config;
    modules: DashboardModule[];
    crashedModules: DashboardModule[];
    plugins: DashboardPlugin[];
    player?: DashboardPlayer;
    settings: {
      [key: string]: ModuleSettings;
    };
    settingsSchemas: {
      [key: string]: ModuleSettingsSchema;
    };
  };
  notification: {
    message: string;
    type: 'info' | 'success' | 'error';
    duration?: number;
  };
  focus: null;
  msaRequest: MicrosoftDeviceAuthorizationResponse;

  updateConfig: Config;
  updateModules: {
    modules: DashboardModule[];
    crashedModules: DashboardModule[];
    settings: {
      [key: string]: ModuleSettings;
    };
    settingsSchemas: {
      [key: string]: ModuleSettingsSchema;
    };
  };
  updatePlugins: DashboardPlugin[];
  updatePlayer: DashboardPlayer;
};

export type IncomingDashboardEvents = {
  kill: null;
  reloadConfig: null;
  toggleModule: {
    name: string;
    enabled: boolean;
  };
  updateSettings: {
    moduleKey: string;
    settings: any;
  };
};

// Intervals

setInterval(() => updateDashboardPlayer(), 500);

// Utilities

export async function updateAll() {
  await updateConfig();
  updateMeta();
  updateDashboardPlayer();
}

export async function updateConfig() {
  dashboard.emit('updateConfig', await getConfigAsync());
}

export function updateMeta() {
  dashboard.emit('updateModules', {
    modules: player.modules.map((m) => ({
      name: m.name,
      description: m.description,
      enabled: m.enabled,
      createdBy: m.createdBy,
      key: m.configKey,
    })),
    crashedModules: player.crashedModules.map((m) => ({
      name: m.name,
      description: m.description,
      enabled: m.enabled,
      createdBy: m.createdBy,
      key: m.configKey,
    })),
    settings: player.settings,
    settingsSchemas: player.settingsSchemas,
  });
  dashboard.emit('updatePlugins', player.plugins);
}

export function updateDashboardPlayer() {
  dashboard.emit('updatePlayer', getDashboardPlayer());
  updateActivity();
}

// Data Getters

export function getDashboardPlayer() {
  return player?.online
    ? {
        username: player.client.username,
        uuid: player.uuid,
        status: player.status
          ? {
              online: player.status.online,
              game: player.status.game,
              mode: player.status.mode,
              map: player.status.map,
            }
          : null,
        statusMessage: player.statusMessage,
      }
    : null;
}

// Data Types

export interface DashboardPlayer {
  username: string;
  uuid: string;
  status: {
    online: boolean;
    game?: Game;
    mode?: string;
    map?: string;
  };
  statusMessage: string;
}

export interface DashboardModule {
  name: string;
  description: string;
  enabled: boolean;
  createdBy?: PluginInfo;
  key?: string;
}

export type DashboardPlugin = PluginInfo;
