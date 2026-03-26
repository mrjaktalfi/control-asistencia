const fs = require('fs');

let content = fs.readFileSync('index.tsx', 'utf8');

content = content.replace(/\.subscribe\('\*', ([a-zA-Z0-9_]+)\);/g, ".subscribe('*', $1).catch(console.error);");

fs.writeFileSync('index.tsx', content);
console.log('Replaced subscribe calls');
