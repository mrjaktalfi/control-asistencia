import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const locs = await pb.collection('locations').getFullList({ filter: 'active = true' });
        console.log('Active locations:', locs.length);
        const allLocs = await pb.collection('locations').getFullList();
        console.log('All locations:', allLocs.length);

        const emps = await pb.collection('employees').getFullList({ filter: 'active = true' });
        console.log('Active employees:', emps.length);
        const allEmps = await pb.collection('employees').getFullList();
        console.log('All employees:', allEmps.length);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
