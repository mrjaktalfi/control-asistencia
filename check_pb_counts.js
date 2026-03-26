import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const locs = await pb.collection('locations').getList(1, 50);
        console.log('Locations count:', locs.totalItems);
        const emps = await pb.collection('employees').getList(1, 100);
        console.log('Employees count:', emps.totalItems);
        const sess = await pb.collection('current_sessions').getList(1, 50);
        console.log('Sessions count:', sess.totalItems);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
