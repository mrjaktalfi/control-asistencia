const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

const oldError = `        if (parsed.error && parsed.error.includes("permission-denied")) {
          errorMsg = "No tienes permisos suficientes para acceder a esta información. Por favor, verifica tu configuración de PocketBase o inicia sesión.";
        }`;

const newError = `        if (parsed.error && parsed.error.includes("permission-denied")) {
          errorMsg = "No tienes permisos suficientes para acceder a esta información. Por favor, verifica tu configuración de PocketBase o inicia sesión.";
        }`;

// Actually, PocketBase error is usually not "permission-denied", it's a 403 or 400.
// But we don't need to change it.

// Let's check `formatTime`
const oldFormatTime = `const formatTime = (dateOrTimestamp) => {
    if (!dateOrTimestamp) return '--:--';
    const date = new Date(dateOrTimestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};`;

// That's fine.

// Let's check if there are any other `firebase` references.
code = code.replace(/window\.firebase/g, 'null');
code = code.replace(/window\.firestoreDB/g, 'null');
code = code.replace(/window\.firebaseConfig/g, 'null');

fs.writeFileSync('index.tsx', code);
