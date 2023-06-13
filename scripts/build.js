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
  run('cd dashboard && npm run build');
}

console.log('\ninfo: build successful! 🎉\n -> Run the app using `npm start`');
