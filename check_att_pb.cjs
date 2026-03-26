const PocketBase = require('pocketbase').default;

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const atts = await pb.collection('attendance').getList(1, 1, { requestKey: null });
        console.log('Attendance collection exists. Total items:', atts.totalItems);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
