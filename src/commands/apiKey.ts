import { player } from '..';
import Command from '../Classes/Command';
import { getConfigAsync } from '../utils/config';

const command = new Command(
  'api', // Command name
  [], // Command syntax
  [] // Command aliases
);

command.onTriggered = async () => {
  const { apiKey } = await getConfigAsync();

  const message = {
    text: `\n\n  §aYour API Key is\n    §b${apiKey}\n\n`,
    clickEvent: {
      action: 'suggest_command',
      value: apiKey,
    },
    hoverEvent: {
      action: 'show_text',
      value: '§eClick to put key in chat so you can copy!',
    },
  };

  player.client.write('chat', { message: JSON.stringify(message) });
};

export default command;
