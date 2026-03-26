import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function clear() {
    try {
        console.log("Borrando locations...");
        const locs = await pb.collection('locations').getFullList();
        for (const l of locs) await pb.collection('locations').delete(l.id);

        console.log("Borrando employees...");
        const emps = await pb.collection('employees').getFullList();
        for (const e of emps) await pb.collection('employees').delete(e.id);

        console.log("Borrando current_sessions...");
        const sess = await pb.collection('current_sessions').getFullList();
        for (const s of sess) await pb.collection('current_sessions').delete(s.id);

        console.log("¡Limpieza completada!");
    } catch (e) {
        console.error("Error limpiando:", e.message);
    }
}

clear();
