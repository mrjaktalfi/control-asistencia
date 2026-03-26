const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

code = code.replace(/const dbStatus = \!\!getDB\(\);/, 'const dbStatus = true;');
fs.writeFileSync('index.tsx', code);
