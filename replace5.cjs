const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

const oldInject = `    const injectSampleData = async () => {
        
        if (!db) return showToast('No hay conexión con BD', 'error');
        try {
            // Seed Locations with Colors
            const locs = [
                { name: 'Sucursal Centro', address: 'Av. Principal 100', active: true, color: '#2563eb' }, // Blue
                { name: 'Sucursal Norte', address: 'Plaza Norte, Local 4', active: true, color: '#9333ea' }, // Purple
                { name: 'Believe Club', address: 'Calle 123', active: true, color: '#059669' }, // Emerald
                { name: 'Oficina Central', address: 'Av. Empresa', active: true, color: '#ea580c' }, // Orange
            ];
            // Sort just in case
            locs.sort((a,b) => a.name.localeCompare(b.name));
            for (const l of locs) await db.collection('locations').add(l);

            // Seed Employees from provided list
            const rawNames = [
                "JULIO", "JENNY", "JESSICA", "ARAO", "PEDRO", "JOSE ANYELO",
                "MIKI", "DANNY LI", "BRAYAN", "PAVEL", "IVAN", "DIEGO", "ADRIÁ",
                "VICTORIA B", "FOZZI", "GUILLERMO", "GUI 2", "CAMILO", "CAMILO 2",
                "MARI LUZ", "DOVIMA", "NICO", "JOSE CA", "DMITRI", "ERIC", "AITANA",
                "BEÑAT", "AGUSTIN", "WACILL", "PABLO", "TONI", "IKU", "ALEX O",
                "WISSAM", "NATALIA", "MARC", "LUISIANA", "DAVID NUEVO 2", "JOSEPH",
                "MIGUEL", "CARLOS", "ALISON", "ADRAIN", "ZEBRA", "OLMO", "ANGEL",
                "QUIM", "JOSEP GAYON", "LEO 20", "LLUC CANTOS", "FRAN CULO", "JOSE"
            ];
            
            // Filter duplicates and sort alphabetically
            const uniqueNames = Array.from(new Set(rawNames)).sort((a, b) => a.localeCompare(b));

            const emps = uniqueNames.map(name => ({
                 name: name,
                 position: 'Staff',
                 active: true,
                 avatar: ''
            }));

            for (const e of emps) await db.collection('employees').add(e);
            
            showToast(\`Inyectados \${uniqueNames.length} empleados\`, 'success');
        } catch (e) {
            console.error(e);
            showToast('Error inyectando datos', 'error');
        }
    };`;

const newInject = `    const injectSampleData = async () => {
        try {
            // Seed Locations with Colors
            const locs = [
                { name: 'Sucursal Centro', address: 'Av. Principal 100', active: true, color: '#2563eb' }, // Blue
                { name: 'Sucursal Norte', address: 'Plaza Norte, Local 4', active: true, color: '#9333ea' }, // Purple
                { name: 'Believe Club', address: 'Calle 123', active: true, color: '#059669' }, // Emerald
                { name: 'Oficina Central', address: 'Av. Empresa', active: true, color: '#ea580c' }, // Orange
            ];
            // Sort just in case
            locs.sort((a,b) => a.name.localeCompare(b.name));
            for (const l of locs) await pb.collection('locations').create(l);

            // Seed Employees from provided list
            const rawNames = [
                "JULIO", "JENNY", "JESSICA", "ARAO", "PEDRO", "JOSE ANYELO",
                "MIKI", "DANNY LI", "BRAYAN", "PAVEL", "IVAN", "DIEGO", "ADRIÁ",
                "VICTORIA B", "FOZZI", "GUILLERMO", "GUI 2", "CAMILO", "CAMILO 2",
                "MARI LUZ", "DOVIMA", "NICO", "JOSE CA", "DMITRI", "ERIC", "AITANA",
                "BEÑAT", "AGUSTIN", "WACILL", "PABLO", "TONI", "IKU", "ALEX O",
                "WISSAM", "NATALIA", "MARC", "LUISIANA", "DAVID NUEVO 2", "JOSEPH",
                "MIGUEL", "CARLOS", "ALISON", "ADRAIN", "ZEBRA", "OLMO", "ANGEL",
                "QUIM", "JOSEP GAYON", "LEO 20", "LLUC CANTOS", "FRAN CULO", "JOSE"
            ];
            
            // Filter duplicates and sort alphabetically
            const uniqueNames = Array.from(new Set(rawNames)).sort((a, b) => a.localeCompare(b));

            const emps = uniqueNames.map(name => ({
                 name: name,
                 position: 'Staff',
                 active: true,
                 avatar: ''
            }));

            for (const e of emps) await pb.collection('employees').create(e);
            
            showToast(\`Inyectados \${uniqueNames.length} empleados\`, 'success');
        } catch (e) {
            console.error(e);
            showToast('Error inyectando datos', 'error');
        }
    };`;

code = code.replace(oldInject, newInject);
fs.writeFileSync('index.tsx', code);
