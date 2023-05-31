const { writeFileSync } = require('fs');
const { join } = require('path');

writeFileSync(join(__dirname, 'src/cwd.js'), `export const cwd = "${join(__dirname, '../').replace(/\\/g, "\\\\")}";`, 'utf-8');
console.log('Setup Dashboard CWD!');
