const PocketBase = require('pocketbase').default;

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const locs = await pb.collection('locations').getFullList({ requestKey: null });
        console.log('Location 0 active type:', typeof locs[0].active, locs[0].active);
        const emps = await pb.collection('employees').getFullList({ requestKey: null });
        console.log('Employee 0 active type:', typeof emps[0].active, emps[0].active);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
