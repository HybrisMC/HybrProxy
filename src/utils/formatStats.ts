import { Mode, PlayerData } from '../Types';

export const GameStatNames = {
  DUELS_BRIDGE_DUEL: ['bridge', '1v1'],
  DUELS_BRIDGE_DOUBLES: ['bridge', '2v2'],
  DUELS_BRIDGE_THREES: ['bridge', 'overall'],
  DUELS_BRIDGE_FOUR: ['bridge', '4v4'],
  DUELS_BRIDGE_2V2V2V2: ['bridge', 'overall'],
  DUELS_BRIDGE_3V3V3V3: ['bridge', 'overall'],
  DUELS_CAPTURE_THREES: ['bridge', 'overall'],
  DUELS_UHC_DUEL: ['uhc', '1v1'],
  DUELS_UHC_DOUBLES: ['uhc', '2v2'],
  DUELS_UHC_FOUR: ['uhc', '4v4'],
  DUELS_UHC_MEETUP: ['uhc', 'meetup'],
  DUELS_SUMO_DUEL: 'sumo',
};

export default function (
  playerData: PlayerData,
  mode: Mode
): { string: string; stats: { [key: string]: unknown } } {
  let string = `${playerData.formattedNickname} §7- `;
  let stats: any = playerData.stats.duels;
  const statName = GameStatNames[mode];

  if (statName) {
    if (typeof statName === 'string') stats = stats[statName];
    else for (const item of statName) stats = stats[item];

    string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
  } else string += '§cUnknown Game Mode';

  return { string, stats };
}
