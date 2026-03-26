const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

const oldTest = `// 6. Test View
const Test = () => {
    const [status, setStatus] = useState('Esperando...');
    
    const runTests = async () => {
        setStatus('Ejecutando pruebas...');
        
        const firebaseGlobal = window.firebase;
        
        let debugInfo = '';
        if (!firebaseGlobal) debugInfo += '❌ Global \`firebase\` no encontrado.\\n';
        else {
            debugInfo += '✅ Global \`firebase\` detectado.\\n';
            debugInfo += \`   - Apps: \${firebaseGlobal.apps ? firebaseGlobal.apps.length : 0}\\n\`;
            debugInfo += \`   - Firestore SDK: \${firebaseGlobal.firestore ? 'Disponible' : 'NO Disponible'}\\n\`;
        }
        
        if (window.firestoreDB) {
            debugInfo += '✅ window.firestoreDB está definido.\\n';
        } else {
            debugInfo += '❌ window.firestoreDB es NULL.\\n';
        }

        if (window.firebaseConfig) {
             debugInfo += '✅ window.firebaseConfig está definido.\\n';
        } else {
             debugInfo += '⚠️ window.firebaseConfig es undefined (Usando fallback).\\n';
        }

        if (!db) {
            setStatus(\`❌ Error: Firebase no está inicializado.\\nDiagnóstico:\\n\${debugInfo}Verifica la consola para más detalles.\`);
            return;
        }

        try {
            setStatus(prev => prev + '\\n✅ Conexión Firebase: OK');
            
            // Try a real read
            const snap = await db.collection('locations').limit(1).get();
            setStatus(prev => prev + \`\\n✅ Lectura Firestore: OK (\${snap.size} docs)\`);
            
            setStatus(prev => prev + '\\n✅ Sistema listo.');
        } catch (e) {
            setStatus(prev => prev + \`\\n❌ Error Firestore: \${e.message}\`);
        }
    };`;

const newTest = `// 6. Test View
const Test = () => {
    const [status, setStatus] = useState('Esperando...');
    
    const runTests = async () => {
        setStatus('Ejecutando pruebas...');
        
        let debugInfo = '';
        debugInfo += '✅ PocketBase instanciado.\\n';

        try {
            setStatus(prev => prev + '\\n✅ Conexión PocketBase: OK');
            
            // Try a real read
            const records = await pb.collection('locations').getList(1, 1);
            setStatus(prev => prev + \`\\n✅ Lectura PocketBase: OK (\${records.items.length} docs)\`);
            
            setStatus(prev => prev + '\\n✅ Sistema listo.');
        } catch (e) {
            setStatus(prev => prev + \`\\n❌ Error PocketBase: \${e.message}\`);
        }
    };`;

code = code.replace(oldTest, newTest);
fs.writeFileSync('index.tsx', code);
