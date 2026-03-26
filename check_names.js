import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const locs = await pb.collection('locations').getFullList({ requestKey: null });
        locs.forEach(l => {
            if (!l.name) console.log('Location without name:', l.id);
        });
        const emps = await pb.collection('employees').getFullList({ requestKey: null });
        emps.forEach(e => {
            if (!e.name) console.log('Employee without name:', e.id);
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
