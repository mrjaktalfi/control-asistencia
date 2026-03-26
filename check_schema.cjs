const PocketBase = require('pocketbase').default;

const pb = new PocketBase('https://api.fichajes.believ3.top');

async function checkSchema() {
    try {
        // We can't easily get schema without admin auth, 
        // but we can check a record's raw data
        const locs = await pb.collection('locations').getFullList({ requestKey: null });
        console.log('Raw Location 0:', JSON.stringify(locs[0], null, 2));
        
        const emps = await pb.collection('employees').getFullList({ requestKey: null });
        console.log('Raw Employee 0:', JSON.stringify(emps[0], null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
checkSchema();
