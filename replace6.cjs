const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

const oldDashboard = `    // 1. Fetch Locations
    useEffect(() => {
        
        if(!db) return;
        const unsubscribe = db.collection('locations')
            .where('active', '==', true)
            .onSnapshot((snap) => {
                const locs = snap.docs.map(d => ({id: d.id, ...d.data()}));
                locs.sort((a, b) => a.name.localeCompare(b.name));
                setLocations(locs);
            }, (error) => handlePocketBaseError(error, OperationType.LIST, 'locations'));
        return () => unsubscribe();
    }, []);

    // 2. Fetch ALL Active Sessions
    useEffect(() => {
        
        if(!db) return;
        const unsubscribe = db.collection('current_sessions')
            .onSnapshot((snap) => {
                const sessions = snap.docs.map(d => ({id: d.id, ...d.data()}));
                setActiveSessions(sessions);
            }, (error) => handlePocketBaseError(error, OperationType.LIST, 'current_sessions'));
        return () => unsubscribe();
    }, []);`;

const newDashboard = `    // 1. Fetch Locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const locs = await pb.collection('locations').getFullList({ filter: 'active = true' });
                locs.sort((a, b) => a.name.localeCompare(b.name));
                setLocations(locs);
            } catch (error) {
                console.error(error);
            }
        };
        fetchLocations();
        pb.collection('locations').subscribe('*', fetchLocations);
        return () => { pb.collection('locations').unsubscribe('*'); };
    }, []);

    // 2. Fetch ALL Active Sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const sessions = await pb.collection('current_sessions').getFullList();
                setActiveSessions(sessions);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSessions();
        pb.collection('current_sessions').subscribe('*', fetchSessions);
        return () => { pb.collection('current_sessions').unsubscribe('*'); };
    }, []);`;

code = code.replace(oldDashboard, newDashboard);

// Also fix the sorting logic in Dashboard
const oldSort = `                    locSessions.sort((a, b) => {
                         const tA = a.checkIn ? a.checkIn.seconds : 0;
                         const tB = b.checkIn ? b.checkIn.seconds : 0;
                         return tB - tA;
                    });`;

const newSort = `                    locSessions.sort((a, b) => {
                         const tA = a.checkIn ? new Date(a.checkIn).getTime() : 0;
                         const tB = b.checkIn ? new Date(b.checkIn).getTime() : 0;
                         return tB - tA;
                    });`;

code = code.replace(oldSort, newSort);

fs.writeFileSync('index.tsx', code);
