import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const locs = await pb.collection('locations').getFullList({ filter: 'active = true', requestKey: null });
        console.log('Locations fetched successfully:', locs.length);
    } catch (e) {
        console.error('Error fetching locations:', e.status, e.message);
    }
}
check();
