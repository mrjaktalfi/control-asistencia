const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const res = await pb.collection('locations').getList(1, 1);
        console.log('Locations exists:', res);
    } catch (e) {
        console.error('Locations error:', e.message);
    }
}
check();
