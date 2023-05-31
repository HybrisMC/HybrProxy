import { config, player } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(323);
settingItem.displayName = '§6Bridge §5Player §6Distance';
settingItem.lore = [
  '',
  "§7Shows you your opponent's and yourself's",
  '§7distances from the goals.',
  '',
  `§7Current: §${
    config.modules.bridgePlayerDistance ? 'aEnabled' : 'cDisabled'
  }`,
];

const playerModule = new PlayerModule(
  'Bridge Player Distances',
  "Shows you your opponent's and yourself's distances from the goals.",
  settingItem,
  'bridgePlayerDistance'
);

let side;
player.listener.on('switch_server', () => (side = null));
player.proxyHandler.on('fromServer', ({ data, name }) => {
  if (
    name !== 'set_slot' ||
    data.windowId !== 0 ||
    ![5, 6, 7, 8].includes(data.slot) ||
    !player.isInGameMode('DUELS_BRIDGE')
  )
    return;
  setTimeout(() => {
    side = player.location.x > 0 ? 'Pos' : 'Neg';
  }, 250);
});

setInterval(() => {
  if (
    !playerModule.enabled ||
    !side ||
    !player.connectedPlayers ||
    player.connectedPlayers.length > 1 ||
    !player.isInGameMode('DUELS_BRIDGE') ||
    !player.location?.x ||
    !player.connectedPlayers?.[0]?.location?.x
  )
    return;
  const meDist = side === 'Pos' ? 0 - player.location.x : 0 + player.location.x;
  const oppDist =
    side === 'Pos'
      ? 0 + player.connectedPlayers[0].location.x
      : 0 - player.connectedPlayers[0].location.x;
  player.client?.write('chat', {
    message: JSON.stringify({
      text:
        Math.round(meDist) == Math.round(oppDist)
          ? `§fYou and your opponent are §eequal §fdistances away from the goals`
          : Math.round(meDist * 10) / 10 > Math.round(oppDist * 10) / 10
          ? `§fYou are §6${
              Math.round((meDist - oppDist) * 10) / 10
            } §fblocks §aahead §fof your opponent`
          : `§fYou are §6${
              Math.round((oppDist - meDist) * 10) / 10
            } blocks §cbehind §fyour opponent`,
    }),
    position: 2,
  });
}, 50);

export default playerModule;
