const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

const oldReportsUseEffect = `    useEffect(() => {
        
        if(!db) return;
        
        // Load Locations for Dropdown
        db.collection('locations').where('active', '==', true).get().then(snap => {
            setAllLocations(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => a.name.localeCompare(b.name)));
        });

        // Load Employees for Dropdown
        db.collection('employees').where('active', '==', true).get().then(snap => {
            setAllEmployees(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => a.name.localeCompare(b.name)));
        });
        
        // Initial Fetch
        fetchReports();
    }, []);`;

const newReportsUseEffect = `    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const locs = await pb.collection('locations').getFullList({ filter: 'active = true' });
                locs.sort((a,b) => a.name.localeCompare(b.name));
                setAllLocations(locs);

                const emps = await pb.collection('employees').getFullList({ filter: 'active = true' });
                emps.sort((a,b) => a.name.localeCompare(b.name));
                setAllEmployees(emps);
            } catch (error) {
                console.error(error);
            }
        };
        fetchDropdowns();
        fetchReports();
    }, []);`;

code = code.replace(oldReportsUseEffect, newReportsUseEffect);

const oldFetchReports = `    const fetchReports = async () => {
        
        if(!db) return;
        setLoading(true);
        
        try {
            // Basic query by date range
            let query = db.collection('attendance')
                .where('date', '>=', startDate)
                .where('date', '<=', endDate);
            
            const snap = await query.get();
            const data = snap.docs.map(d => d.data());
            
            // Client side sorting by date desc
            data.sort((a, b) => {
                if(a.date !== b.date) return b.date.localeCompare(a.date);
                // If same date, sort by checkIn time
                const tA = a.checkIn ? a.checkIn.seconds : 0;
                const tB = b.checkIn ? b.checkIn.seconds : 0;
                return tB - tA;
            });
            
            setRecords(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
            showToast("Error cargando reportes", "error");
        } finally {
            setLoading(false);
        }
    };`;

const newFetchReports = `    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await pb.collection('attendance').getFullList({
                filter: \`date >= '\${startDate}' && date <= '\${endDate}'\`
            });
            
            // Client side sorting by date desc
            data.sort((a, b) => {
                if(a.date !== b.date) return b.date.localeCompare(a.date);
                // If same date, sort by checkIn time
                const tA = a.checkIn ? new Date(a.checkIn).getTime() : 0;
                const tB = b.checkIn ? new Date(b.checkIn).getTime() : 0;
                return tB - tA;
            });
            
            setRecords(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
            showToast("Error cargando reportes", "error");
        } finally {
            setLoading(false);
        }
    };`;

code = code.replace(oldFetchReports, newFetchReports);
fs.writeFileSync('index.tsx', code);
