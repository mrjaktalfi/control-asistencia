const fs = require('fs');

let content = fs.readFileSync('index.tsx', 'utf8');

content = content.replace(/l\.name\.toLowerCase\(\)/g, "(l.name || '').toLowerCase()");
content = content.replace(/e\.name\.toLowerCase\(\)/g, "(e.name || '').toLowerCase()");

fs.writeFileSync('index.tsx', content);
console.log('Replaced toLowerCase calls');
