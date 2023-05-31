import { config } from '..';
import Command from '../Classes/Command';
import Inventory from '../Classes/Inventory';
import Item from '../Classes/Item';
import Logger from '../Classes/Logger';
import { updateMeta } from '../dashboard';
import { InventoryType, WindowClickEvent } from '../Types';
import { getConfigAsync, setValue } from '../utils/config';

const command = new Command(
  'hybrproxy',
  [
    {
      argument: 'action',
      required: false,
      type: 'string',
    },
  ],
  ['hp', 'proxy']
);

command.onTriggered = async (chatCommand, args) => {
  await getConfigAsync();

  const player = command.player;

  const action = command.getStringArgument(args, 0, true);
  if (action === 'reload') {
    await getConfigAsync();
    player.sendMessage('§aHybrProxy config successfully reloaded!');
    return;
  } else if (action === 'stop') {
    player.client.end('Stopping server...');
    Logger.info('Stopping server...');
    return process.exit(0);
  }

  const inventory = new Inventory(
    InventoryType.CHEST,
    '§cSettings §8- §fHybr§cProxy',
    45
  );

  const nametag = new Item(421);
  nametag.displayName = '§fAPI Key';
  nametag.lore = [
    '',
    '§7The API key is used to retrieve',
    '§7data from the Hypixel API',
    '',
    `§7Current: §o${config.apiKey ?? '§rnone'}`,
  ];

  const commandBlock = new Item(137);
  commandBlock.displayName = '§fServer actions';
  commandBlock.lore = [
    '',
    '§7Manage HybrProxy',
    '§7proxy server from here',
    '',
    '§7§nActions:',
    '§7§lRight Click §r§7- Stop server',
    '§7§lLeft Click §r§7- Restart server',
  ];

  const barrier = new Item(166);
  barrier.displayName = '§cClose';

  const paper = new Item(339);
  paper.displayName = '§fStatus';
  paper.lore = [
    '',
    `§7Player: §a${player.client.username}`,
    `§7Uptime: ${Math.floor(process.uptime())}s`,
  ];

  inventory.setItems([
    { item: nametag, position: 0 },
    { item: commandBlock, position: 36 },
    { item: barrier, position: 40 },
    { item: paper, position: 44 },
  ]);

  const settingsMutator: {
    [key: number]: (event: WindowClickEvent) => void;
  } = {};

  for (const module of command.player.modules) {
    if (!Object.prototype.hasOwnProperty.call(module, 'settingItem')) return;

    const slot = Object.keys(inventory.items).length - 3;
    module.settingItem.lore[
      module.settingItem.lore.find((i) => i.startsWith('§7Current: '))
        ? module.settingItem.lore.findIndex((i) => i.startsWith('§7Current: '))
        : module.settingItem.lore.length
    ] = `§7Current: §${
      config.modules[module.configKey] ? 'aEnabled' : 'cDisabled'
    }`;
    inventory.setItem(module.settingItem, slot);

    settingsMutator[slot] = async (event) => {
      event.cancel();
      const newConfig = { ...config.modules };
      newConfig[module.configKey] = !config.modules[module.configKey];
      await setValue('modules', newConfig);
      module.settingItem.lore[
        module.settingItem.lore.find((i) => i.startsWith('§7Current: '))
          ? module.settingItem.lore.findIndex((i) =>
              i.startsWith('§7Current: ')
            )
          : module.settingItem.lore.length
      ] = `§7Current: §${
        config.modules[module.configKey] ? 'aEnabled' : 'cDisabled'
      }`;
      inventory.setItem(module.settingItem, slot);
      module.onConfigChange(config.modules[module.configKey]);
      module.toggleEnabled(config.modules[module.configKey]);
      updateMeta();
    };
  }

  inventory.on('click', (event) => {
    event.cancel();

    switch (event.slot) {
      case 0:
        // Sends A Message In Chat (In Hypixel's Format) With The API Key
        inventory.close();
        player.client?.write('chat', {
          message: JSON.stringify({
            text: `\n\n    §aYour API Key is\n    §b${config.apiKey}\n\n`,
            clickEvent: {
              action: 'suggest_command',
              value: config.apiKey,
            },
            hoverEvent: {
              action: 'show_text',
              value: '§eClick to put key in chat so you can copy!',
            },
          }),
        });
        break;
      case 36:
        if (event.button === 0) {
          player.client.end('Stopping server...');
          Logger.info('Stopping server...');
          return process.exit(0);
        }

        if (event.button === 1) {
          player.sendMessage('§cNot implemented yet!');
        }
        break;
      case 40:
        inventory.close();
        break;
      case 44:
        break;
      default:
        // Other slot, handling here
        if (settingsMutator[event.slot]) settingsMutator[event.slot](event);

        break;
    }
  });

  inventory.display();
};

export default command;
