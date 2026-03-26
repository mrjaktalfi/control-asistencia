const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

const oldAdminUseEffect = `    useEffect(() => {
        
        if(!db) return;
        
        const unsubLoc = db.collection('locations').onSnapshot((snap) => 
            setLocations(snap.docs.map((d) => ({id: d.id, ...d.data()})).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
        , (error) => handlePocketBaseError(error, OperationType.LIST, 'locations'));
        const unsubEmp = db.collection('employees').onSnapshot((snap) => 
            setEmployees(snap.docs.map((d) => ({id: d.id, ...d.data()})).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
        , (error) => handlePocketBaseError(error, OperationType.LIST, 'employees'));
        return () => { unsubLoc(); unsubEmp(); };
    }, []);`;

const newAdminUseEffect = `    useEffect(() => {
        const fetchAll = async () => {
            try {
                const locs = await pb.collection('locations').getFullList();
                locs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                setLocations(locs);
                
                const emps = await pb.collection('employees').getFullList();
                emps.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                setEmployees(emps);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAll();
        pb.collection('locations').subscribe('*', fetchAll);
        pb.collection('employees').subscribe('*', fetchAll);
        return () => {
            pb.collection('locations').unsubscribe('*');
            pb.collection('employees').unsubscribe('*');
        };
    }, []);`;

code = code.replace(oldAdminUseEffect, newAdminUseEffect);

const oldHandleSubmit = `            if (activeTab === 'locations') {
                if (editItem) {
                    await db.collection('locations').doc(editItem.id).update(data);
                    showToast('Local actualizado', 'success');
                } else {
                    await db.collection('locations').add(data);
                    showToast('Local creado', 'success');
                }
            } else {
                if (editItem) {
                    await db.collection('employees').doc(editItem.id).update(data);
                    showToast('Empleado actualizado', 'success');
                } else {
                    await db.collection('employees').add(data);
                    showToast('Empleado creado', 'success');
                }
            }`;

const newHandleSubmit = `            if (activeTab === 'locations') {
                if (editItem) {
                    await pb.collection('locations').update(editItem.id, data);
                    showToast('Local actualizado', 'success');
                } else {
                    await pb.collection('locations').create(data);
                    showToast('Local creado', 'success');
                }
            } else {
                if (editItem) {
                    await pb.collection('employees').update(editItem.id, data);
                    showToast('Empleado actualizado', 'success');
                } else {
                    await pb.collection('employees').create(data);
                    showToast('Empleado creado', 'success');
                }
            }`;

code = code.replace(oldHandleSubmit, newHandleSubmit);

const oldConfirmDelete = `        if (!db) {
            showToast('Error de conexión con base de datos', 'error');
            return;
        }
        
        try {
            console.log(\`Eliminando \${collection}/\${id}...\`);
            await db.collection(collection).doc(id).delete();
            showToast('Eliminado correctamente', 'info');
            setDeleteConfirmation(null);
        } catch(err) { 
            console.error('Delete error:', err);
            showToast(\`Error: \${err.message}\`, 'error'); 
        }`;

const newConfirmDelete = `        try {
            console.log(\`Eliminando \${collection}/\${id}...\`);
            await pb.collection(collection).delete(id);
            showToast('Eliminado correctamente', 'info');
            setDeleteConfirmation(null);
        } catch(err) { 
            console.error('Delete error:', err);
            showToast(\`Error: \${err.message}\`, 'error'); 
        }`;

code = code.replace(oldConfirmDelete, newConfirmDelete);

fs.writeFileSync('index.tsx', code);
