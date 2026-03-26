const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

// 1. Imports and Setup
code = code.replace(/import React, \{ useState, useEffect, useMemo, useRef \} from 'react';\nimport \{ createRoot \} from 'react-dom\/client';/, `import React, { useState, useEffect, useMemo, useRef } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport PocketBase from 'pocketbase';\n\nconst pb = new PocketBase('https://api.fichajes.believ3.top/');`);

// Remove Window interface firebase properties
code = code.replace(/declare global \{\n    interface Window \{\n        firestoreDB: any;\n        firebase: any;\n        firebaseConfig: any;\n    \}\n\}\n/g, '');

// Remove Firebase Access section
code = code.replace(/\/\/ --- Firebase Access ---[\s\S]*?\/\/ --- Helper Functions ---/, '// --- Helper Functions ---');

// Replace getTimestamp
code = code.replace(/const getTimestamp = \(\) => window\.firebase\?\.firestore\?\.FieldValue\.serverTimestamp\(\);/g, '');
code = code.replace(/getTimestamp\(\)/g, 'new Date().toISOString()');

// Replace formatTime
code = code.replace(/const formatTime = \(dateOrTimestamp\) => \{[\s\S]*?\};/, `const formatTime = (dateOrTimestamp) => {
    if (!dateOrTimestamp) return '--:--';
    const date = new Date(dateOrTimestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};`);

// Replace handleFirestoreError
code = code.replace(/function handleFirestoreError[\s\S]*?\}\n/g, `function handlePocketBaseError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('PocketBase Error: ', error, operationType, path);
}\n`);

// Replace handleFirestoreError calls
code = code.replace(/handleFirestoreError/g, 'handlePocketBaseError');

fs.writeFileSync('index.tsx', code);
