import * as chalk from 'chalk';
import { Client, ping } from 'minecraft-protocol';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { InstantConnectProxy } from 'prismarine-proxy';
import { NIL } from 'uuid';
import Logger from './Classes/Logger';
import BossBar from './Classes/PlayerControllers/BossBar';
import PlayerManager from './Classes/PlayerManager';
import { Config, reloadEmotes } from './Types';
import initDashboard, { updateConfig } from './dashboard';
import Player from './player/Player';
import { filePath, getConfig } from './utils/config';
import { createClient } from './utils/hypixel';
import setupTray from './utils/systray';

export const isPacked: boolean = Object.prototype.hasOwnProperty.call(
  process,
  'pkg'
);
export const version = JSON.parse(
  readFileSync(
    isPacked ? join(__dirname, '..', 'package.json') : 'package.json',
    'utf8'
  )
).version;
export let config = getConfig();
export const dashboard = initDashboard();
if (
  !/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(
    config.apiKey
  )
) {
  Logger.error(
    'Invalid API Key! Make sure to put a valid API Key in the config.json(c) file'
  );
  process.exit(1);
}
export const hypixelClient = createClient(config.apiKey);

process.title = 'HybrProxy';

export function reloadConfig(data: Config, log = true) {
  if (JSON.stringify(config) == JSON.stringify(data)) return;
  config = data;
  reloadEmotes();
  if (log) {
    Logger.info('Config Reloaded');
    dashboard.emit('notification', {
      message: 'The Config was Reloaded',
      type: 'info',
    });
  }
  updateConfig();
}

console.log(` _   _           _              ____                                
| | | |  _   _  | |__    _ __  |  _ \\   _ __    ___   __  __  _   _ 
| |_| | | | | | | '_ \\  | '__| | |_) | | '__|  / _ \\  \\ \\/ / | | | |
|  _  | | |_| | | |_) | | |    |  __/  | |    | (_) |  〉〈  | |_| |
|_| |_|  \\__, | |_.__/  |_|    |_|     |_|     \\___/  /_/\\_\\  \\__, |
         |___/                                                |___/ `);
let versionString = '';
for (let i = 0; i < 60 - version.length; i++) versionString += ' ';
console.log(`${versionString}v${version}\n`);

export const playerManager = new PlayerManager();

export let toClient: Client;
const proxy = new InstantConnectProxy({
  loginHandler: (client) => {
    toClient = client;
    player.proxyHandler.setupListeners();
    return {
      auth: 'microsoft',
      username: client.username,
    };
  },

  serverOptions: {
    version: '1.8.9',
    motd: '§fHybr§cProxy',
    port: config.proxyPort,
    maxPlayers: 1,
    beforePing: async (response, client, callback) => {
      response = await ping({
        host: config.server.host,
        port: config.server.port,
        version: client.version,
      });
      response.players.sample = [{ name: '§fHybr§cProxy', id: NIL }];

      callback(null, response);
    },
    validateChannelProtocol: false,
  },

  clientOptions: {
    version: '1.8.9',
    host: config.server.host,
    port: config.server.port,
    onMsaCode(data) {
      dashboard.emit('msaRequest', data);
      dashboard.emit('focus', null);
      Logger.info(
        `Please login to Microsoft to continue! Go to "${data.verification_uri}" and enter the code ${data.user_code} to authenticate!`
      );
    },
    validateChannelProtocol: false,
  },
});
Logger.info('Proxy started');

writeFileSync(filePath, JSON.stringify(config, null, 2));

export const player = new Player(proxy);

import './ErrorCatcher';

// Triggered when the player connects
// AND changes server (when connected to a proxy like Bungeecord) for some reason
player.proxyHandler.on('start', (client, server) => {
  if (!player.online) {
    toClient = client as Client;
    Logger.info(`${chalk.italic.bold(client.username)} connected to the proxy`);
    player.connect(client, server);
  }
});

player.proxyHandler.on('end', (username, log) => {
  toClient = null;
  if (log && player.online)
    Logger.info(`${chalk.italic.bold(username)} disconnected from the proxy`);
  player.disconnect();
});

if (!config.dashboard.enabled || process.platform !== 'darwin') setupTray();

export const bossBar = new BossBar('§fHybr§cProxy', 300);
bossBar.render();

export function updateMainBossBar() {
  const name = `§fHybr§cProxy §f| ${player.statusMessage}`;

  if (bossBar.text != name) bossBar.setText(name);
}
setInterval(() => updateMainBossBar(), 500);

// import './Classes/PlayerControllers/SideBar';
