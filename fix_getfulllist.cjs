const fs = require('fs');

let content = fs.readFileSync('index.tsx', 'utf8');

content = content.replace(/getFullList\(\{ filter: 'active = true' \}\)/g, "getFullList({ filter: 'active = true', requestKey: null })");
content = content.replace(/getFullList\(\)/g, "getFullList({ requestKey: null })");

fs.writeFileSync('index.tsx', content);
console.log('Replaced getFullList calls');
