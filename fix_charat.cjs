const fs = require('fs');

let content = fs.readFileSync('index.tsx', 'utf8');

content = content.replace(/loc\.name\.charAt\(0\)/g, "(loc.name || '?').charAt(0)");

fs.writeFileSync('index.tsx', content);
console.log('Replaced charAt calls');
