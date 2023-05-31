import { config, player } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(7);
settingItem.displayName = '§6Height Limit Delay §eFix';
settingItem.lore = [
  '',
  '§7Makes the the height limit in',
  '§7bridge more responsive',
  '',
  `§7Current: §${
    config.modules.heightLimitDelayFix ? 'aEnabled' : 'cDisabled'
  }`,
];

const playerModule = new PlayerModule(
  'Bridge Height Limit',
  'Make block removal faster when reaching height limit in bridge',
  settingItem,
  'heightLimitDelayFix'
);

player.proxyHandler.on('fromClient', ({ data: packet, name }, toClient) => {
  if (
    name !== 'block_place' ||
    !playerModule.enabled ||
    !player.isInGameMode('DUELS_BRIDGE') ||
    packet.heldItem.blockId !== 159 ||
    !(
      (packet.direction === 1 && packet.location.y >= 99) ||
      packet.location.y > 99
    )
  )
    return true;
  const realBlockLocation = {
    x: packet.location.x,
    y: packet.location.y,
    z: packet.location.z,
  };
  switch (packet.direction) {
    case 0:
      realBlockLocation.x = packet.location.x - 1;
      break;
    case 1:
      realBlockLocation.y = packet.location.y + 1;
      break;
    case 2:
      realBlockLocation.z = packet.location.z - 1;
      break;
    case 3:
      realBlockLocation.z = packet.location.z + 1;
      break;
    case 4:
      realBlockLocation.x = packet.location.x - 1;
      break;
    case 5:
      realBlockLocation.x = packet.location.x + 1;
      break;
    default:
      break;
  }
  toClient.write('block_change', {
    location: realBlockLocation,
    type: 0,
  });
  return false;
});

export default playerModule;
