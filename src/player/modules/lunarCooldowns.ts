import { config, player } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(347);
settingItem.displayName = '§6Lunar §5Cooldowns';
settingItem.lore = [
  '',
  '§7Adds support for Lunar',
  '§7Cooldowns in some modes',
  '',
  `§7Current: §${config.modules.lunarCooldowns ? 'aEnabled' : 'cDisabled'}`,
];

const playerModule = new PlayerModule(
  'Lunar Cooldowns',
  'Add support for Lunar Cooldowns',
  settingItem,
  'lunarCooldowns'
);

player.proxyHandler.on('fromServer', ({ data, name }) => {
  if (
    name !== 'set_slot' ||
    data.windowId !== 0 ||
    data.slot !== 44 ||
    !playerModule.enabled ||
    !player.isInGameMode('DUELS_BRIDGE_')
  )
    return true;

  switch (data.item.blockId) {
    case -1:
      player.lcPlayer?.addCooldown('hypixel_bow', 3500, 261);
      break;
    case 262:
      player.lcPlayer?.removeCooldown('hypixel_bow');
      break;
    default:
      break;
  }
});

export default playerModule;
