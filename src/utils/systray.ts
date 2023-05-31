import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import SysTray, { MenuItem } from 'systray';
import { config, dashboard } from '..';
import { getConfigAsync } from './config';

export default function setupTray(): SysTray {
  if (process.argv.includes('--noTray')) return null;

  const items: MenuItem[] = [
    {
      title: 'Show Dashboard',
      tooltip: 'Show the Dashboard Window',
      checked: false,
      enabled: config.dashboard.enabled,
    },
    {
      title: 'Reload config',
      tooltip: 'Reload HybrProxy Config',
      checked: false,
      enabled: true,
    },
    {
      title: 'Exit',
      tooltip: 'Shutdown HybrProxy',
      checked: false,
      enabled: true,
    },
  ];

  const systray = new SysTray({
    menu: {
      title: 'HybrProxy',
      tooltip:
        'Click to see HybrProxy tray menu. Take actions easily from here.',
      icon: readFileSync(
        join(__dirname, '..', '..', 'assets', 'icon.ico'),
        'base64'
      ),
      items,
    },
    copyDir: true,
  });

  systray.onClick(async (event) => {
    switch (event.seq_id) {
      case 0:
        dashboard.emit('focus', null);
        break;
      case 1:
        await getConfigAsync();
        break;
      case 2:
        systray.kill();
        process.exit(0);
      default:
        break;
    }
  });

  return systray;
}
