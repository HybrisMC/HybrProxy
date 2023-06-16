import { parseUUID } from '@minecraft-js/uuid';
import { config, player, playerManager } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

let party = {};

const settingItem = new Item(397);
settingItem.meta = 3;
settingItem.displayName = '§rParty View';
settingItem.lore = [
  '',
  '§7Use The Lunar Client Team View',
  '§7Mod To See Your Party Members',
  '',
  `§7Current: §${config.modules.partyView ? 'aEnabled' : 'cDisabled'}`,
];

const playerModule = new PlayerModule(
  'Party View',
  'View Your Party Members With LC Team View',
  settingItem,
  'partyView'
);

player.proxyHandler.on('fromServer', async ({ name, data }) => {
  if (name !== 'chat') return;

  const message = JSON.parse(data.message);
  message.extra ??= [];

  const text = [message.text, ...message.extra.map((i) => i.text)].join('');

  if (text.endsWith('joined the party.')) {
    const subtext = text.split(' ');

    const name = subtext
      .splice(
        subtext[0].startsWith('[') ? 1 : 0,
        subtext.length - (subtext[0].startsWith('[') ? 4 : 3)
      )
      .join(' ');

    const p = await playerManager.fetchUsername(name).catch(() => null);

    if (!p) return;

    party[name.toLowerCase()] = p.uuid;

    if (playerModule.enabled)
      player.customClient.addTeammate({
        uuid: parseUUID(p.uuid),
      });
  }

  if (text.endsWith('left the party.') && !text.startsWith('You')) {
    const subtext = text.split(' ');

    const name = subtext
      .splice(
        subtext[0].startsWith('[') ? 1 : 0,
        subtext.length - (subtext[0].startsWith('[') ? 4 : 3)
      )
      .join(' ');

    const p = party[name.toLowerCase()];

    if (!p) return;

    delete party[name.toLowerCase()];

    if (playerModule.enabled)
      player.customClient.removeTeammate({
        uuid: parseUUID(p.uuid),
      });
  }

  if (
    text.includes('has disbanded the party!') ||
    text.includes('You left the party.') ||
    text.includes('You are not currently in a party.')
  ) {
    party = {};

    player.customClient.removeAllTeammates();
  }

  if (text.includes('You have joined') && text.includes('party!')) {
    setTimeout(() => player.executeCommand('/party list'), 1000);
  }

  if (text.includes('Party Leader:')) {
    const subtext = text.split(' ');

    const name = subtext
      .splice(
        subtext[0].startsWith('[') ? 4 : 3,
        subtext.length - (subtext[0].startsWith('[') ? 5 : 4)
      )
      .join(' ');

    party = {};

    player.customClient.removeAllTeammates();

    const p = await playerManager.fetchUsername(name).catch(() => null);

    if (!p) return;

    party[name.toLowerCase()] = p.uuid;

    if (playerModule.enabled)
      player.customClient.addTeammate({
        uuid: parseUUID(p.uuid),
      });
  }
  if (text.includes('Party Moderators:') || text.includes('Party Members:')) {
    const subtext = text.split(' ');

    const names = subtext
      .splice(2, subtext.length)
      .join(' ')
      .split('● ')
      .map((i) =>
        i
          .split(' ')
          .splice(
            subtext[0].startsWith('[') ? 2 : 1,
            subtext.length - (subtext[0].startsWith('[') ? 2 : 1)
          )
          .join(' ')
      );

    const players = [];

    for (const name of names) {
      const p = await playerManager.fetchUsername(name).catch(() => null);

      if (!p) continue;

      party[name.toLowerCase()] = p.uuid;
      players.push(p);
    }

    if (playerModule.enabled)
      for (const p of players) {
        player.customClient.addTeammate({
          uuid: parseUUID(p.uuid),
        });
      }
  }
});

playerModule.onConfigChange = async (enabled) => {
  player.customClient.removeAllTeammates();

  if (enabled) {
    for (const p in party)
      player.customClient.addTeammate({
        uuid: parseUUID(party[p]),
      });
  }
};

player.listener.on('switch_server', async () => {
  await new Promise((res) => setTimeout(res, 1000));
  if (playerModule.enabled) {
    player.customClient.removeAllTeammates();

    await new Promise((res) => setTimeout(res, 500));

    for (const p in party)
      player.customClient.addTeammate({
        uuid: parseUUID(party[p]),
      });
  }
});

player.listener.on('player_join', (id, name) => {
  if (playerModule.enabled && party[name.toLowerCase()]) {
    player.customClient.addTeammate({
      uuid: parseUUID(party[name.toLowerCase()]),
    });
  }
});

export default playerModule;
