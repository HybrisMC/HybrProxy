const { execSync } = require('child_process');

function run(executable, params = []) {
  execSync(`${executable} ${params.join(' ')}`, {
    shell: true,
    stdio: 'inherit',
  });
}

console.log('info: compiling typescript 💽');
run('npx', ['tsc']);

if (!process.argv.includes('--noDashboard')) {
  console.log('info: building dashboard 🌐');

  const nodeVersion = parseInt(process.version.split('.')[0].substring(1));

  if (nodeVersion < 16)
    throw new Error('You must use Node 16 or higher to build dashboard!');
  if (nodeVersion > 16) console.log('fix: Setting OpenSSL Provider 🐛');

  run(
    nodeVersion > 16
      ? 'cd dashboard && NODE_OPTIONS=--openssl-legacy-provider npm run build'
      : 'cd dashboard && npm run build'
  );
}

console.log('\ninfo: build successful! 🎉\n -> Run the app using `npm start`');
