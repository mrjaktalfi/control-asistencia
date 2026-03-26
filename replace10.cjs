const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

code = code.replace(/Powered by Firebase/g, 'Powered by PocketBase');
code = code.replace(/configuración de Firebase/g, 'configuración de PocketBase');
code = code.replace(/\/\/ Define custom interface for Window to include firebase properties/g, '');

fs.writeFileSync('index.tsx', code);
