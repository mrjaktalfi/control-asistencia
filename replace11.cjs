const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

code = code.replace(/interface FirestoreErrorInfo/g, 'interface PocketBaseErrorInfo');
code = code.replace(/const errInfo: FirestoreErrorInfo/g, 'const errInfo: PocketBaseErrorInfo');

fs.writeFileSync('index.tsx', code);
