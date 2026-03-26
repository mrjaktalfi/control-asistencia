
class AdminPanelFunctional {
    constructor() {
        this.initialized = false;
        this.locations = [];
        this.employees = [];
        this.db = null;
    }
    
    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        this.db = window.firestoreDB;
        this.loadLocations();
        this.loadEmployees();
    }
    
    async loadLocations() {
        const tbody = document.getElementById('locations-table-body');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4">Cargando...</td></tr>';
        
        if (this.db) {
            const snap = await this.db.collection('locations').get();
            this.locations = snap.docs.map(d => ({id: d.id, ...d.data()}));
        } else {
             // Mock
             this.locations = [{id: '1', name: 'Local Test', address: 'Test Addr', active: true}];
        }
        this.renderLocations();
    }

    renderLocations() {
        const tbody = document.getElementById('locations-table-body');
        tbody.innerHTML = '';
        this.locations.forEach(loc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="p-3">${loc.name}</td>
                <td class="p-3">${loc.address}</td>
                <td class="p-3">${loc.active ? 'Activo' : 'Inactivo'}</td>
                <td class="p-3">
                    <button class="text-blue-600" onclick="adminPanel.editLocation('${loc.id}')">Editar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    async loadEmployees() {
        // Similar logic for employees
        const grid = document.getElementById('employees-grid');
        if(!grid) return;
        grid.innerHTML = '<p class="p-4">Cargando...</p>';
        
        if (this.db) {
            const snap = await this.db.collection('employees').get();
            this.employees = snap.docs.map(d => ({id: d.id, ...d.data()}));
        }
        
        grid.innerHTML = '';
        this.employees.forEach(emp => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 border rounded shadow-sm';
            card.innerHTML = `
                <h4 class="font-bold">${emp.name}</h4>
                <p class="text-sm text-gray-500">${emp.email}</p>
                <button class="mt-2 text-sm text-blue-600">Editar</button>
            `;
            grid.appendChild(card);
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('.admin-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    }
    
    openLocationModal() { document.getElementById('location-modal').classList.remove('hidden'); }
    closeLocationModal() { document.getElementById('location-modal').classList.add('hidden'); }
    
    openEmployeeModal() { document.getElementById('employee-modal').classList.remove('hidden'); }
    closeEmployeeModal() { document.getElementById('employee-modal').classList.add('hidden'); }
    
    // Stub methods for functionality
    saveLocation(e) { e.preventDefault(); this.closeLocationModal(); alert('Guardado (Simulado)'); this.loadLocations(); }
    saveEmployee(e) { e.preventDefault(); this.closeEmployeeModal(); alert('Guardado (Simulado)'); this.loadEmployees(); }
    
    injectSampleData() { alert('Inyectando datos de prueba...'); }
    clearAllData() { alert('Limpiando datos...'); }
}

window.adminPanel = new AdminPanelFunctional();
