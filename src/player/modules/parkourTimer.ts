import { config, player } from '../..';
import Command from '../../Classes/Command';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(147);
settingItem.displayName = '§6Parkour Timer';
settingItem.lore = [
  '',
  '§7An automatic live parkour timer',
  '',
  `§7Current: §${config?.modules.parkourTimer ? 'aEnabled' : 'cDisabled'}`,
];

const playerModule = new PlayerModule(
  'Parkour Timer',
  'An automatic live parkour timer',
  settingItem,
  'parkourTimer'
);

const command = new Command(
  'reset', // Command name
  [], // Command syntax
  ['pr'] // Command aliases
);

let timeStarted = null;
let timeStartedCheckpoint = null;
let checkpoint = null;

command.onTriggered = (cmd, args, pass) => {
  if (!playerModule.enabled) return pass();

  player.executeCommand('/parkour reset');
  timeStarted = null;
  timeStartedCheckpoint = null;
  checkpoint = null;
};

player.commandHandler.registerCommand(command.setPlayer(player));

player.proxyHandler.on('fromServer', ({ data, name }) => {
  if (name != 'chat' || data.position != 0) return;
  let {
    message,
  }: {
    message: any;
  } = data;
  message = JSON.parse(message);
  message.extra ??= [];
  message = [message.text, ...message.extra.map((i) => i.text)].join('');
  if (
    message.includes('Parkour challenge started!') ||
    message.includes('Reset your timer to 00:00!')
  ) {
    timeStarted = Date.now();
    timeStartedCheckpoint = timeStarted;
    checkpoint = 1;
  }
  if (
    message.includes('cancelled') ||
    message.includes('failed') ||
    message.includes('completed') ||
    message.includes('record')
  ) {
    timeStarted = null;
    timeStartedCheckpoint = null;
    checkpoint = null;
  }
  if (
    message.match(
      /You reached Checkpoint #[0-9]+ after [0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]/
    )
  ) {
    timeStartedCheckpoint = Date.now();
    const res = message.match(/Checkpoint #[0-9]+/);
    checkpoint = parseInt(res[0].substring(res.index)) + 1;
  }
});

function parseTime(ms) {
  let minutes: string | number = Math.floor(ms / 60000);
  ms = ms - minutes * 60000;
  let seconds: string | number = Math.floor(ms / 1000);
  ms = ms - seconds * 1000;

  minutes = minutes.toString();
  seconds = seconds.toString();
  let milliseconds = ms.toString();

  while (minutes.length < 2) minutes = '0' + minutes;
  while (seconds.length < 2) seconds = '0' + seconds;
  while (milliseconds.length < 3) milliseconds = '0' + milliseconds;

  return `§a${minutes}§f:§a${seconds}§f.§a${ms}`;
}

setInterval(() => {
  if (
    playerModule.enabled &&
    timeStarted &&
    timeStartedCheckpoint &&
    checkpoint
  ) {
    const time = Date.now() - timeStarted;
    const checkpointTime = Date.now() - timeStartedCheckpoint;

    player.client?.write('chat', {
      message: JSON.stringify({
        text: `§2Total§f: ${parseTime(
          time
        )} §f| §2Checkpoint #§6${checkpoint}§f: ${parseTime(checkpointTime)}`,
      }),
      position: 2,
    });
  }
}, 50);

player.listener.on('switch_server', () => {
  timeStarted = null;
  timeStartedCheckpoint = null;
  checkpoint = null;
});

export default playerModule;
