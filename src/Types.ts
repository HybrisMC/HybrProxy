import { Waypoint } from '@minecraft-js/lunarbukkitapi';
import { Player as HypixelPlayer } from 'hypixel-api-reborn';
import { Client } from 'minecraft-protocol';
import { config } from '.';

export interface Config {
  apiKey: string;
  server: {
    host: string;
    port: number;
  };
  dashboard: {
    enabled: boolean;
    port: number;
  };
  proxyPort: number;
  customEmotes: { [key: string]: string };
  checkForUpdates: boolean;
  autoDownloadUpdates: boolean;
  modules: { [key: string]: boolean };
  settings: { [key: string]: ModuleSettings };
}

export interface PlayerData {
  player: string;
  name: string;
  uuid: string;
  formattedNickname: string;
  stats: typeof HypixelPlayer.prototype.stats;
  online: boolean;
  status?: string;
}

export type Mode =
  | 'DUELS_BRIDGE_DUEL'
  | 'DUELS_BRIDGE_DOUBLES'
  | 'DUELS_BRIDGE_THREES'
  | 'DUELS_BRIDGE_FOUR'
  | 'DUELS_BRIDGE_2V2V2V2'
  | 'DUELS_BRIDGE_3V3V3V3'
  | 'DUELS_CAPTURE_THREES'
  | 'DUELS_UHC_DUEL'
  | 'DUELS_UHC_DOUBLES'
  | 'DUELS_UHC_FOUR'
  | 'DUELS_UHC_MEETUP'
  | 'DUELS_SUMO_DUEL';

export interface PlayerInfo {
  UUID: string;
  entityID: number;
}

export type ListenerEvents = {
  switch_server: (toServer: Client) => void;
  server_full: (playerCount: number) => void;
  team_create: (name: string) => void;
  team_delete: (name: string) => void;
  team_edit: (data: unknown) => void;
  team_player_add: (name: string, players: string[]) => void;
  player_join: (uuid: string, username: string) => void;
  player_spawn: (uuid: string, entityId: number, location: Location) => void;
  player_leave: (entityId: number) => void;
  entity_teleport: (entityId: number, location: Location) => void;
  entity_move: (entityId: number, difference: Location) => void;
  entity_velocity: (entityId: number, velocity: Location) => void;
  title: (
    action: number,
    text?: string,
    fadeIn?: number,
    stay?: number,
    fadeOut?: number
  ) => void;
  action_bar: (message: object) => void;
  client_move: (location: Location) => void;
  client_face: (direction: Direction, raw: Direction) => void;
};

export interface BlockPlacePacket {
  location: {
    x: number;
    y: number;
    z: number;
  };
  direction: number;
  heldItem: {
    blockId: number;
    itemCount: number;
    itemDamage: number;
    nbtData: unknown;
  };
  cursorX: number;
  cursorY: number;
  cursorZ: number;
}

export type Command =
  | '/d'
  | '/dodge'
  | '/requeue'
  | '/rq'
  | '/req'
  | '/stat'
  | '/stats'
  | '/st'
  | '/spawnfakeplayer'
  | '/sfp'
  | '/dumppackets'
  | '/dp';

export type CommandSyntaxType = 'string' | 'number' | 'json' | 'array';

export interface CommandSyntax {
  argument: string;
  type: CommandSyntaxType;
  required: boolean;
}

export interface WaypointsMappings {
  [key: string]: {
    modes: string[];
    waypoints: Waypoint[];
  }[];
}

export enum InventoryType {
  ANVIL = 'minecraft:anvil',
  BEACON = 'minecraft:beacon',
  BREWING = 'minecraft:brewing_stand',
  CHEST = 'minecraft:chest',
  CONTAINER = 'minecraft:container',
  CRAFTING = 'minecraft:crafting_table',
  DISPENSER = 'minecraft:dispenser',
  DROPPER = 'minecraft:dropper',
  ENCHANTING_TABLE = 'minecraft:enchanting_table',
  FURNACE = 'minecraft:furnace',
  HOPPER = 'minecraft:hopper',
  VILLAGER = 'minecraft:villager',
}

export type InventoryEvents = {
  close: () => void;
  click: (event: WindowClickEvent) => void;
};

export interface WindowClickEvent {
  slot: number;
  button: number;
  mode: number;
  raw: unknown;
  toServer: Client;
  cancel: () => void;
}

export interface Team {
  name: string;
  players: string[];
}

export interface IPlayer {
  name: string;
  uuid: string;
  entityId?: number;
  location?: Location;
}

export const baseEmotes = {
  '<3': '❤',
  ':star:': '✮',
  ':yes:': '✔',
  ':no:': '✖',
  ':java:': '☕',
  ':arrow:': '➜',
  ':shrug:': '¯\\_(ツ)_/¯',
  ':tableflip:': '(╯°□°）╯︵ ┻━┻',
  'o/': '( ﾟ◡ﾟ)/',
  ':123:': '①②③',
  ':totem:': '☉_☉',
  ':typing:': '✎...',
  ':maths:': '√(π+x)=L',
  ':snail:': "@'-'",
  ':thinking:': '(0.o?)',
  ':gimme:': '༼つ ◕◕ ༽つ',
  ':wizard:': "('-')⊃━☆ﾟ.*･｡ﾟ",
  ':pvp:': '⚔',
  ':peace:': '✌',
  ':oof:': 'OOF',
  ':puffer:': "<('O')>",
  ':yey:': 'ヽ (◕◡◕) ﾉ',
  ':cat:': '= ＾● ⋏ ●＾ =',
  ':dab:': '<o/',
  ':dj:': 'ヽ(⌐■_■)ノ♬',
  ':snow:': '☃',
  '^_^': '^_^',
  'h/': 'ヽ(^◇^*)/',
  '^-^': '^-^',
  ':sloth:': '(・⊝・)',
  ':cute:': '(✿◠‿◠)',
  ':dog:': '(ᵔᴥᵔ)',
};
export let emotes = {
  ...baseEmotes,
  ...config?.customEmotes,
};
export function reloadEmotes() {
  emotes = {
    ...baseEmotes,
    ...config?.customEmotes,
  };
}

export interface Location {
  x: number;
  y: number;
  z: number;
}

export interface Direction {
  yaw: number;
  pitch: number;
}

export type ValueOf<T> = T[keyof T];

export type ModuleSettings = {
  [key: string]: string | number | boolean | ModuleSettings;
};
export type ModuleSettingsSchema = {
  [key: string]: 'string' | 'number' | 'boolean' | ModuleSettingsSchema;
};
