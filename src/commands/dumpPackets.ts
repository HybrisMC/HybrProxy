import { writeFile } from 'node:fs/promises';
import Command from '../Classes/Command';

const command = new Command(
  'dumppackets',
  [
    {
      argument: 'time ms',
      required: true,
      type: 'number',
    },
    {
      argument: 'ignored packets',
      required: false,
      type: 'array',
    },
  ],
  ['dp']
);

command.onTriggered = (chatCommand, args) => {
  const packets: {
    name: string;
    timestamp: string;
    packet: unknown;
    from: 'server' | 'client';
  }[] = [];
  const ignoredPackets: string[] = command.getArrayArgument(
    args,
    1,
    true
  ) as string[];

  const callback =
    (from: 'server' | 'client') =>
    ({ data, name }) => {
      if (!ignoredPackets.includes(name))
        packets.push({
          name: name,
          timestamp: Date.now().toString(),
          packet: data,
          from,
        });
    };

  const timeout = command.getNumberArgument(args, 0);

  command.player.proxyHandler.on('fromServer', callback('server'));
  command.player.proxyHandler.on('fromClient', callback('client'));
  command.player.customClient.sendNotification(
    `Dumping packets for ${timeout}ms...`,
    2000
  );

  setTimeout(async () => {
    command.player.proxyHandler.removeListener(
      'fromServer',
      callback('server')
    );
    command.player.proxyHandler.removeListener(
      'fromClient',
      callback('client')
    );
    await writeFile('packetDump.json', JSON.stringify(packets, null, 2));

    command.player.customClient.sendNotification(
      `Dumped ${packets.length} packets to packetDump.json`,
      2000
    );
  }, timeout);
};

export default command;
