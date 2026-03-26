const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

// Replace getDB() with pb
code = code.replace(/const db = getDB\(\);\n\s*if \(\!db\) return( showToast\('Error de conexión con base de datos', 'error'\))?;/g, '');
code = code.replace(/const db = getDB\(\);/g, '');

// Replace db.collection('locations').where('active', '==', true).onSnapshot(...)
code = code.replace(/\/\/ Fetch Locations Real-time[\s\S]*?\}, \[\]\);/m, `// Fetch Locations Real-time
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const records = await pb.collection('locations').getFullList({ filter: 'active = true' });
                records.sort((a, b) => a.name.localeCompare(b.name));
                setLocations(records);
            } catch (error) {
                handlePocketBaseError(error, OperationType.LIST, 'locations');
            }
        };
        fetchLocations();
        pb.collection('locations').subscribe('*', fetchLocations);
        return () => { pb.collection('locations').unsubscribe('*'); };
    }, []);`);

// Replace db.collection('employees').where('active', '==', true).onSnapshot(...)
code = code.replace(/\/\/ Fetch Employees Real-time[\s\S]*?\}, \[\]\);/m, `// Fetch Employees Real-time
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const records = await pb.collection('employees').getFullList({ filter: 'active = true' });
                records.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                setEmployees(records);
            } catch (error) {
                handlePocketBaseError(error, OperationType.LIST, 'employees');
            }
        };
        fetchEmployees();
        pb.collection('employees').subscribe('*', fetchEmployees);
        return () => { pb.collection('employees').unsubscribe('*'); };
    }, []);`);

// Replace db.collection('current_sessions').onSnapshot(...)
code = code.replace(/\/\/ Fetch Active Sessions Real-time[\s\S]*?\}, \[\]\);/m, `// Fetch Active Sessions Real-time
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const records = await pb.collection('current_sessions').getFullList();
                setActiveSessions(records);
            } catch (error) {
                handlePocketBaseError(error, OperationType.LIST, 'current_sessions');
            }
        };
        fetchSessions();
        pb.collection('current_sessions').subscribe('*', fetchSessions);
        return () => { pb.collection('current_sessions').unsubscribe('*'); };
    }, []);`);

fs.writeFileSync('index.tsx', code);
