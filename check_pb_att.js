import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const res = await pb.collection('attendance').getList(1, 1);
        console.log('Attendance exists:', res);
    } catch (e) {
        console.error('Attendance error:', e.message);
    }
}
check();
