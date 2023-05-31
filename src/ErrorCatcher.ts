import { dashboard, player, toClient } from '.';
import Logger from './Classes/Logger';

process.on('uncaughtException', (err) => {
  const msg = err.message;

  // Invalid API Key
  if (msg.includes('[hypixel-api-reborn] Invalid API Key!')) {
    Logger.error(
      'Invalid API Key! Make sure to put a valid API Key in the config.json file'
    );
    dashboard.emit('notification', {
      message: 'Invalid API Key!',
      type: 'error',
      duration: 2000,
    });
    process.exit(1);
  }

  // RateLimited
  if (
    msg.includes('RateLimiter disallowed request') ||
    (msg.includes('429 Too Many Requests') &&
      msg.includes('"path" : "/authentication/login_with_xbox"'))
  ) {
    Logger.error('You were RateLimited!');
    toClient?.end(
      '§fYou have been §cRateLimited§f, please try again in a moment.'
    );
    dashboard.emit('notification', {
      message: 'You were RateLimited!',
      type: 'error',
      duration: 3000,
    });
    player.proxyHandler.emit('end', toClient.username, false);
    return;
  }

  // Port Taken
  if (msg.includes('listen EADDRINUSE: address already in use')) {
    Logger.error(
      'The Proxy Port is unavailable, check if another program is using it or if another instance of HybrProxy is running.'
    );
    process.exit(1);
  }

  throw err;
});
