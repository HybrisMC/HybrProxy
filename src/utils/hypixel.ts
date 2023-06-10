import { Client, Color, Game, Player, Status } from 'hypixel-api-reborn';
import { hypixelClient } from '..';
import { PlayerData } from '../Types';

export function createClient(apiKey: string): Client {
  const client = new Client(apiKey, {
    cache: true,
    silent: true,
    headers: {
      // Just leaving our footprint :D
      'User-Agent': 'HybrProxy | https://github.com/HybrisMC/HybrProxy-Pre',
    },
  });

  client.getKeyInfo({ noCaching: true }).catch((error) => {
    throw error;
  });

  return client;
}

const cache: PlayerData[] = [];
export async function fetchPlayerData(
  playerOrUuid: string
): Promise<PlayerData | null> {
  if (
    cache.find(
      (i) =>
        i.uuid.replace(/-/g, '') === playerOrUuid.replace(/-/g, '') ||
        i.name === playerOrUuid
    )
  )
    return cache.find(
      (i) =>
        i.uuid.replace(/-/g, '') === playerOrUuid.replace(/-/g, '') ||
        i.name === playerOrUuid
    );

  const playerData: PlayerData = {
    player: playerOrUuid,
    name: null,
    uuid: null,
    formattedNickname: null,
    stats: null,
    online: false,
  };

  while (!playerData.uuid) {
    try {
      const player = await hypixelClient.getPlayer(playerOrUuid);

      playerData.name = player.nickname;
      playerData.uuid = player.uuid.replace(/-/g, '');
      playerData.stats = player.stats;
      playerData.formattedNickname = transformNickname(player);

      if (player.isOnline) {
        playerData.online = true;

        playerData.status = await hypixelClient
          .getStatus(playerData.uuid)
          .then((status) => status?.mode);
      } else playerData.online = false;

      cache.push(playerData);
      setTimeout(() => {
        cache.splice(
          cache.findIndex((i) => i.uuid === playerData.uuid),
          1
        );
      }, 15 * 60 * 1000); // Refresh Every 15 Minutes

      return playerData;
    } catch {
      playerData.uuid = null;
    }
  }
}

export async function fetchPlayerLocation(uuid: string): Promise<Status> {
  return new Promise<Status>((resolve, reject) => {
    hypixelClient
      .getStatus(uuid, { noCacheCheck: true, noCaching: true })
      .then((status) => {
        if (status?.mode)
          status.mode = status.mode.replace(/BED WARS/g, 'BEDWARS');
        resolve(status);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
}

export function transformNickname(player: Player): string {
  let nickname = '';
  switch (player.rank) {
    case 'Admin':
    // @ts-expect-error - In case
    case 'ADMIN':
      nickname = `§cAdmin ${player.nickname}`;
      break;
    case 'Game Master':
    // @ts-expect-error - In case
    case 'GAME MASTER':
      nickname = `§2[GM] ${player.nickname}`;
      break;
    case 'VIP':
      nickname = `§a[VIP] ${player.nickname}`;
      break;
    case 'VIP+':
    // @ts-expect-error - In case
    case 'VIP_PLUS':
      nickname = `§a[VIP§6+§a] ${player.nickname}`;
      break;
    case 'MVP':
      nickname = `§b[MVP] ${player.nickname}`;
      break;
    case 'MVP+':
    // @ts-expect-error - In case
    case 'MVP_PLUS':
      nickname = `§b[MVP${transformColor(player.plusColor)}+§b] ${
        player.nickname
      }`;
      break;
    case 'MVP++':
    // @ts-expect-error - In case
    case 'MVP_PLUS_PLUS':
      nickname = `§6[MVP${transformColor(player.plusColor)}++§6] ${
        player.nickname
      }`;
      break;
    case 'YouTube':
    // @ts-expect-error - In case
    case 'YOUTUBE':
      nickname = `§c[§fYOUTUBE§c] ${player.nickname}`;
      break;
    case 'MOJANG':
      nickname = `§6[MOJANG] ${player.nickname}`;
      break;
    case 'PIG+++':
      nickname = `§d[PIG§b+++§d] ${player.nickname}`;
      break;
    default:
      nickname = `§7${player.nickname}`;
      break;
  }
  return (nickname += '§r');
}

// Thanks hypixel-api for not providing this one
export function transformColor(color: Color): string {
  let transformed = '§';

  let colorCode = '';

  try {
    colorCode = color.toCode();
  } catch {
    colorCode = 'GRAY';
  }

  switch (colorCode) {
    case 'BLACK':
      transformed += '0';
      break;
    case 'DARK_BLUE':
      transformed += '1';
      break;
    case 'DARK_GREEN':
      transformed += '2';
      break;
    case 'DARK_AQUA':
      transformed += '3';
      break;
    case 'DARK_RED':
      transformed += '4';
      break;
    case 'DARK_PURPLE':
      transformed += '5';
      break;
    case 'GOLD':
      transformed += '6';
      break;
    case 'GRAY':
      transformed += '7';
      break;
    case 'DARK_GRAY':
      transformed += '8';
      break;
    case 'BLUE':
      transformed += '9';
      break;
    case 'GREEN':
      transformed += 'a';
      break;
    case 'AQUA':
      transformed += 'b';
      break;
    case 'RED':
      transformed += 'c';
      break;
    case 'LIGHT_PURPLE':
      transformed += 'd';
      break;
    case 'YELLOW':
      transformed += 'e';
      break;
    case 'WHITE':
      transformed += 'f';
      break;
    default:
      transformed += 'f';
      break;
  }

  return transformed;
}

// From "https://api.connorlinfoot.com/v2/games/hypixel/"
const SkyblockGameModes = [
  { key: 'dynamic', name: 'Private Island' },
  { key: 'hub', name: 'Hub' },
  { key: 'farming_1', name: 'The Farming Islands' },
  { key: 'mining_1', name: 'Gold Mine' },
  { key: 'mining_2', name: 'Deep Caverns' },
  { key: 'mining_3', name: 'Dwarven Mines' },
  { key: 'combat_1', name: "Spider's Den" },
  { key: 'combat_2', name: 'Blazing Fortress' },
  { key: 'combat_3', name: 'The End' },
  { key: 'foraging_1', name: 'Floating Islands' },
  { key: 'dark_auction', name: 'Dark Auction' },
  { key: 'dungeon', name: 'Dungeons' },
  { key: 'crystal_hollows', name: 'Crystal Hollows' },
  { key: 'crimson_isle', name: 'Crimson Isle' },
  { key: 'instanced', name: "Kuudra's Hollow" },
  { key: 'garden', name: 'The Garden' },
];

export function parseGameMode(game: Game, mode: string): string {
  if (game.code === 'SKYBLOCK') {
    const realMode = SkyblockGameModes.find((i) => i.key == mode);
    if (realMode) return realMode.name;
  }

  return mode
    .split('_')
    .map((i) => i[0].toUpperCase() + i.substring(1).toLowerCase())
    .join(' ');
}
