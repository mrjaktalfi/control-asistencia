const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function inject() {
    try {
        console.log('Inyectando locales...');
        const locs = [
            { name: 'Local A', address: 'Calle 1', active: true, color: '#3b82f6' },
            { name: 'Local B', address: 'Calle 2', active: true, color: '#10b981' },
            { name: 'Oficina Central', address: 'Av. Empresa', active: true, color: '#ea580c' },
        ];
        
        for (const l of locs) {
            await pb.collection('locations').create(l);
            console.log(`Creado local: ${l.name}`);
        }

        console.log('Inyectando empleados...');
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
        
        const uniqueNames = Array.from(new Set(rawNames)).sort((a, b) => a.localeCompare(b));

        for (const name of uniqueNames) {
            await pb.collection('employees').create({
                name: name,
                position: 'Staff',
                active: true,
                avatar: ''
            });
            console.log(`Creado empleado: ${name}`);
        }
        
        console.log('¡Inyección completada!');
    } catch (e) {
        console.error('Error inyectando:', e);
    }
}

inject();
