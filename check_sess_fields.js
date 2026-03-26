import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function check() {
    try {
        const sess = await pb.collection('current_sessions').getList(1, 1);
        console.log(sess.items[0]);
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
