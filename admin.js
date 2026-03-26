// Panel de Administración - JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'locations';
        this.locations = [];
        this.employees = [];
        this.editingLocation = null;
        this.editingEmployee = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.updateDateTime();
            setInterval(() => this.updateDateTime(), 1000);
            
            // Inicializar Firebase
            await this.initializeFirebase();
            
            // Cargar datos iniciales
            await this.loadData();
            
            // Mostrar sección inicial
            this.showSection('locations');
            
        } catch (error) {
            console.error('Error inicializando panel de administración:', error);
            this.showToast('Error al inicializar el panel', 'error');
        }
    }
    
    async initializeFirebase() {
        try {
            const config = {
                apiKey: "AIzaSyCQATvoHqEPTgpenBNSav2uBNXjDn4nRXw",
                authDomain: "attendance-40e97.firebaseapp.com",
                projectId: "attendance-40e97",
                storageBucket: "attendance-40e97.firebasestorage.app",
                messagingSenderId: "136574176100",
                appId: "1:136574176100:web:b7f473d849f6341acc4871",
                measurementId: "G-BTZPYS8Y3C"
            };
            
            try {
                const app = firebase.initializeApp(config);
                this.db = firebase.firestore(app);
            } catch (error) {
                this.db = firebase.firestore();
            }
        } catch (error) {
            console.log('Firebase no disponible, usando datos locales');
            this.db = null;
        }
    }
    
    updateDateTime() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const element = document.getElementById('current-date');
        if (element) {
            element.textContent = dateStr;
        }
    }
    
    async loadData() {
        try {
            await this.loadLocations();
            await this.loadEmployees();
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.showToast('Error al cargar datos', 'error');
        }
    }
    
    async loadLocations() {
        try {
            if (this.db) {
                const snapshot = await this.db.collection('locations').get();
                this.locations = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Datos de ejemplo
                this.locations = [
                    {
                        id: 'local_001',
                        name: 'Sucursal Centro',
                        address: 'Calle Principal 123',
                        phone: '+1234567890',
                        image: 'resources/office-1.jpg',
                        active: true,
                        createdAt: new Date()
                    },
                    {
                        id: 'local_002',
                        name: 'Sucursal Norte',
                        address: 'Avenida Norte 456',
                        phone: '+1234567891',
                        image: 'resources/office-2.jpg',
                        active: true,
                        createdAt: new Date()
                    },
                    {
                        id: 'local_003',
                        name: 'Sucursal Sur',
                        address: 'Boulevard Sur 789',
                        phone: '+1234567892',
                        image: 'resources/office-3.jpg',
                        active: false,
                        createdAt: new Date()
                    }
                ];
            }
            
            this.renderLocations();
        } catch (error) {
            console.error('Error cargando locales:', error);
            throw error;
        }
    }
    
    async loadEmployees() {
        try {
            if (this.db) {
                const snapshot = await this.db.collection('employees').get();
                this.employees = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Datos de ejemplo
                this.employees = [
                    {
                        id: 'emp_001',
                        name: 'Juan Pérez',
                        email: 'juan@empresa.com',
                        phone: '+1234567890',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                        position: 'Gerente',
                        active: true,
                        createdAt: new Date()
                    },
                    {
                        id: 'emp_002',
                        name: 'María García',
                        email: 'maria@empresa.com',
                        phone: '+1234567891',
                        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                        position: 'Vendedora',
                        active: true,
                        createdAt: new Date()
                    },
                    {
                        id: 'emp_003',
                        name: 'Carlos Rodríguez',
                        email: 'carlos@empresa.com',
                        phone: '+1234567892',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                        position: 'Cajero',
                        active: true,
                        createdAt: new Date()
                    }
                ];
            }
            
            this.renderEmployees();
        } catch (error) {
            console.error('Error cargando empleados:', error);
            throw error;
        }
    }
    
    showSection(sectionName) {
        // Ocultar todas las secciones
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Animar entrada
            anime({
                targets: targetSection,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                easing: 'easeOutQuart'
            });
        }
        
        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[onclick="adminPanel.showSection('${sectionName}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        this.currentSection = sectionName;
    }
    
    renderLocations() {
        const tbody = document.getElementById('locations-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.locations.forEach(location => {
            const row = document.createElement('tr');
            row.className = 'table-row border-b border-gray-100';
            
            row.innerHTML = `
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-3">
                        <img src="${location.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMxNS40NzcyIDIwIDEyIDE2LjUyMjggMTIgMTJDMTIgNy40NzcyIDE1LjQ3NzIgNCAyMCA0QzI0LjUyMjggNCAyOCA3LjQ3NzIgMjggMTJDMjggMTYuNTIyOCAyNC41MjI4IDIwIDIwIDIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'}" 
                             alt="${location.name}" 
                             class="w-10 h-10 rounded-lg object-cover">
                        <div>
                            <div class="font-semibold text-gray-900">${location.name}</div>
                            <div class="text-sm text-gray-500">${location.id}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4 text-gray-700">${location.address}</td>
                <td class="py-3 px-4 text-gray-700">${location.phone || 'N/A'}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${location.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${location.active ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <div class="flex space-x-2">
                        <button onclick="adminPanel.editLocation('${location.id}')" 
                                class="text-blue-600 hover:text-blue-800 p-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="adminPanel.toggleLocationStatus('${location.id}')" 
                                class="text-${location.active ? 'red' : 'green'}-600 hover:text-${location.active ? 'red' : 'green'}-800 p-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                ${location.active ? 
                                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>' :
                                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>'
                                }
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    renderEmployees() {
        const container = document.getElementById('employees-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.employees.forEach(employee => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200';
            
            card.innerHTML = `
                <div class="flex items-center space-x-4 mb-4">
                    <div class="relative">
                        <img src="${employee.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDUyQzEyIDQyLjA1ODkgMjAuMDU4OSAzNCAzMCAzNEgzNEM0My45NDExIDM0IDUyIDQyLjA1ODkgNTIgNTJWNjRIMTJWNTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}" 
                             alt="${employee.name}" 
                             class="w-16 h-16 rounded-full object-cover">
                        <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${employee.active ? 'bg-green-500' : 'bg-red-500'}"></div>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">${employee.name}</h3>
                        <p class="text-sm text-gray-600">${employee.position || 'Empleado'}</p>
                        <p class="text-xs text-gray-500">${employee.email}</p>
                    </div>
                </div>
                
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Estado:</span>
                        <span class="font-medium ${employee.active ? 'text-green-600' : 'text-red-600'}">
                            ${employee.active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Teléfono:</span>
                        <span class="font-medium text-gray-900">${employee.phone || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="adminPanel.editEmployee('${employee.id}')" 
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm">
                        Editar
                    </button>
                    <button onclick="adminPanel.toggleEmployeeStatus('${employee.id}')" 
                            class="flex-1 bg-${employee.active ? 'red' : 'green'}-600 hover:bg-${employee.active ? 'red' : 'green'}-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-sm">
                        ${employee.active ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });
    }
    
    filterLocations() {
        const searchTerm = document.getElementById('location-search').value.toLowerCase();
        const filterValue = document.getElementById('location-filter').value;
        
        const rows = document.querySelectorAll('#locations-table-body tr');
        
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const address = row.cells[1].textContent.toLowerCase();
            const status = row.cells[3].querySelector('span').textContent.toLowerCase();
            
            const matchesSearch = name.includes(searchTerm) || address.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || 
                                (filterValue === 'active' && status.includes('activo')) ||
                                (filterValue === 'inactive' && status.includes('inactivo'));
            
            row.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
        });
    }
    
    filterEmployees() {
        const searchTerm = document.getElementById('employee-search').value.toLowerCase();
        const filterValue = document.getElementById('employee-filter').value;
        
        const cards = document.querySelectorAll('#employees-grid .bg-white');
        
        cards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const email = card.querySelector('.text-xs').textContent.toLowerCase();
            const status = card.querySelector('.font-medium').textContent.toLowerCase();
            
            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || 
                                (filterValue === 'active' && status.includes('activo')) ||
                                (filterValue === 'inactive' && status.includes('inactivo'));
            
            card.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
        });
    }
    
    openLocationModal() {
        this.editingLocation = null;
        document.getElementById('location-modal-title').textContent = 'Nuevo Local';
        document.getElementById('location-form').reset();
        document.getElementById('location-modal').style.display = 'flex';
        
        // Animar entrada
        anime({
            targets: '#location-modal .bg-white',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
    
    closeLocationModal() {
        document.getElementById('location-modal').style.display = 'none';
        this.editingLocation = null;
    }
    
    editLocation(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (!location) return;
        
        this.editingLocation = location;
        document.getElementById('location-modal-title').textContent = 'Editar Local';
        
        // Llenar formulario
        document.getElementById('location-name').value = location.name;
        document.getElementById('location-address').value = location.address;
        document.getElementById('location-phone').value = location.phone || '';
        document.getElementById('location-image').value = location.image || '';
        
        document.getElementById('location-modal').style.display = 'flex';
        
        // Animar entrada
        anime({
            targets: '#location-modal .bg-white',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
    
    async saveLocation(event) {
        event.preventDefault();
        
        try {
            const formData = {
                name: document.getElementById('location-name').value,
                address: document.getElementById('location-address').value,
                phone: document.getElementById('location-phone').value,
                image: document.getElementById('location-image').value,
                active: true,
                updatedAt: new Date()
            };
            
            if (this.db) {
                if (this.editingLocation) {
                    // Actualizar local existente
                    await this.db.collection('locations').doc(this.editingLocation.id).update(formData);
                    this.showToast('Local actualizado correctamente', 'success');
                } else {
                    // Crear nuevo local
                    formData.createdAt = new Date();
                    const docRef = await this.db.collection('locations').add(formData);
                    this.showToast('Local creado correctamente', 'success');
                }
            } else {
                // Simulación para desarrollo
                if (this.editingLocation) {
                    const index = this.locations.findIndex(loc => loc.id === this.editingLocation.id);
                    this.locations[index] = { ...this.locations[index], ...formData };
                    this.showToast('Local actualizado correctamente', 'success');
                } else {
                    formData.id = 'local_' + Date.now();
                    formData.createdAt = new Date();
                    this.locations.push(formData);
                    this.showToast('Local creado correctamente', 'success');
                }
            }
            
            this.closeLocationModal();
            await this.loadLocations();
            
        } catch (error) {
            console.error('Error guardando local:', error);
            this.showToast('Error al guardar local', 'error');
        }
    }
    
    async toggleLocationStatus(locationId) {
        try {
            const location = this.locations.find(loc => loc.id === locationId);
            if (!location) return;
            
            const newStatus = !location.active;
            
            if (this.db) {
                await this.db.collection('locations').doc(locationId).update({
                    active: newStatus,
                    updatedAt: new Date()
                });
            } else {
                location.active = newStatus;
                location.updatedAt = new Date();
            }
            
            this.showToast(`Local ${newStatus ? 'activado' : 'desactivado'} correctamente`, 'success');
            await this.loadLocations();
            
        } catch (error) {
            console.error('Error cambiando estado del local:', error);
            this.showToast('Error al cambiar estado del local', 'error');
        }
    }
    
    openEmployeeModal() {
        this.editingEmployee = null;
        document.getElementById('employee-modal-title').textContent = 'Nuevo Empleado';
        document.getElementById('employee-form').reset();
        document.getElementById('employee-modal').style.display = 'flex';
        
        // Animar entrada
        anime({
            targets: '#employee-modal .bg-white',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
    
    closeEmployeeModal() {
        document.getElementById('employee-modal').style.display = 'none';
        this.editingEmployee = null;
    }
    
    editEmployee(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;
        
        this.editingEmployee = employee;
        document.getElementById('employee-modal-title').textContent = 'Editar Empleado';
        
        // Llenar formulario
        document.getElementById('employee-name').value = employee.name;
        document.getElementById('employee-email').value = employee.email;
        document.getElementById('employee-phone').value = employee.phone || '';
        document.getElementById('employee-position').value = employee.position || '';
        document.getElementById('employee-avatar').value = employee.avatar || '';
        
        document.getElementById('employee-modal').style.display = 'flex';
        
        // Animar entrada
        anime({
            targets: '#employee-modal .bg-white',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
    
    async saveEmployee(event) {
        event.preventDefault();
        
        try {
            const formData = {
                name: document.getElementById('employee-name').value,
                email: document.getElementById('employee-email').value,
                phone: document.getElementById('employee-phone').value,
                position: document.getElementById('employee-position').value,
                avatar: document.getElementById('employee-avatar').value,
                active: true,
                updatedAt: new Date()
            };
            
            if (this.db) {
                if (this.editingEmployee) {
                    // Actualizar empleado existente
                    await this.db.collection('employees').doc(this.editingEmployee.id).update(formData);
                    this.showToast('Empleado actualizado correctamente', 'success');
                } else {
                    // Crear nuevo empleado
                    formData.createdAt = new Date();
                    const docRef = await this.db.collection('employees').add(formData);
                    this.showToast('Empleado creado correctamente', 'success');
                }
            } else {
                // Simulación para desarrollo
                if (this.editingEmployee) {
                    const index = this.employees.findIndex(emp => emp.id === this.editingEmployee.id);
                    this.employees[index] = { ...this.employees[index], ...formData };
                    this.showToast('Empleado actualizado correctamente', 'success');
                } else {
                    formData.id = 'emp_' + Date.now();
                    formData.createdAt = new Date();
                    this.employees.push(formData);
                    this.showToast('Empleado creado correctamente', 'success');
                }
            }
            
            this.closeEmployeeModal();
            await this.loadEmployees();
            
        } catch (error) {
            console.error('Error guardando empleado:', error);
            this.showToast('Error al guardar empleado', 'error');
        }
    }
    
    async toggleEmployeeStatus(employeeId) {
        try {
            const employee = this.employees.find(emp => emp.id === employeeId);
            if (!employee) return;
            
            const newStatus = !employee.active;
            
            if (this.db) {
                await this.db.collection('employees').doc(employeeId).update({
                    active: newStatus,
                    updatedAt: new Date()
                });
            } else {
                employee.active = newStatus;
                employee.updatedAt = new Date();
            }
            
            this.showToast(`Empleado ${newStatus ? 'activado' : 'desactivado'} correctamente`, 'success');
            await this.loadEmployees();
            
        } catch (error) {
            console.error('Error cambiando estado del empleado:', error);
            this.showToast('Error al cambiar estado del empleado', 'error');
        }
    }
    
    saveSettings() {
        // Simular guardado de configuración
        this.showToast('Configuración guardada correctamente', 'success');
        
        // Animar botón
        const button = event.target;
        anime({
            targets: button,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeOutQuart'
        });
    }
    
    async injectSampleData() {
        try {
            this.showToast('Inyectando datos de muestra...', 'info');
            
            const sampleLocations = [
                {
                    name: 'Sucursal Centro',
                    address: 'Calle Principal 123, Ciudad',
                    phone: '+1234567890',
                    image: 'resources/office-1.jpg',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Sucursal Norte',
                    address: 'Avenida Norte 456, Ciudad',
                    phone: '+1234567891',
                    image: 'resources/office-2.jpg',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Sucursal Sur',
                    address: 'Boulevard Sur 789, Ciudad',
                    phone: '+1234567892',
                    image: 'resources/office-3.jpg',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Sucursal Este',
                    address: 'Calle Este 321, Ciudad',
                    phone: '+1234567893',
                    image: 'resources/hero-bg.jpg',
                    active: true,
                    createdAt: new Date()
                }
            ];
            
            const sampleEmployees = [
                {
                    name: 'Juan Pérez García',
                    email: 'juan.perez@empresa.com',
                    phone: '+1234567890',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                    position: 'Gerente General',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'María García López',
                    email: 'maria.garcia@empresa.com',
                    phone: '+1234567891',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    position: 'Vendedora Senior',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Carlos Rodríguez Martínez',
                    email: 'carlos.rodriguez@empresa.com',
                    phone: '+1234567892',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                    position: 'Cajero Principal',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Ana Martínez Fernández',
                    email: 'ana.martinez@empresa.com',
                    phone: '+1234567893',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                    position: 'Supervisora de Ventas',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Luis Fernández Sánchez',
                    email: 'luis.fernandez@empresa.com',
                    phone: '+1234567894',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                    position: 'Almacenista',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Sofía López González',
                    email: 'sofia.lopez@empresa.com',
                    phone: '+1234567895',
                    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
                    position: 'Atención al Cliente',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Diego González Rodríguez',
                    email: 'diego.gonzalez@empresa.com',
                    phone: '+1234567896',
                    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
                    position: 'Encargado de Tienda',
                    active: true,
                    createdAt: new Date()
                },
                {
                    name: 'Elena Sánchez Díaz',
                    email: 'elena.sanchez@empresa.com',
                    phone: '+1234567897',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
                    position: 'Auxiliar Administrativa',
                    active: true,
                    createdAt: new Date()
                }
            ];
            
            // Inject locations
            let locationsAdded = 0;
            for (const location of sampleLocations) {
                if (this.db) {
                    await this.db.collection('locations').add(location);
                } else {
                    location.id = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    this.locations.push(location);
                }
                locationsAdded++;
            }
            
            // Inject employees
            let employeesAdded = 0;
            for (const employee of sampleEmployees) {
                if (this.db) {
                    await this.db.collection('employees').add(employee);
                } else {
                    employee.id = 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    this.employees.push(employee);
                }
                employeesAdded++;
            }
            
            // Reload data
            await this.loadLocations();
            await this.loadEmployees();
            
            this.showToast(`Datos inyectados: ${locationsAdded} locales y ${employeesAdded} empleados`, 'success');
            
            // Show detailed report
            setTimeout(() => {
                this.showToast('¡Datos listos para usar! Visita la página principal para probar el fichaje.', 'info');
            }, 2000);
            
        } catch (error) {
            console.error('Error inyectando datos:', error);
            this.showToast('Error al inyectar datos: ' + error.message, 'error');
        }
    }
    
    async clearAllData() {
        if (!confirm('¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            this.showToast('Limpiando todos los datos...', 'info');
            
            if (this.db) {
                // Clear locations
                const locationsSnapshot = await this.db.collection('locations').get();
                const locationsBatch = this.db.batch();
                locationsSnapshot.docs.forEach(doc => {
                    locationsBatch.delete(doc.ref);
                });
                await locationsBatch.commit();
                
                // Clear employees
                const employeesSnapshot = await this.db.collection('employees').get();
                const employeesBatch = this.db.batch();
                employeesSnapshot.docs.forEach(doc => {
                    employeesBatch.delete(doc.ref);
                });
                await employeesBatch.commit();
                
                // Clear attendance
                const attendanceSnapshot = await this.db.collection('attendance').get();
                const attendanceBatch = this.db.batch();
                attendanceSnapshot.docs.forEach(doc => {
                    attendanceBatch.delete(doc.ref);
                });
                await attendanceBatch.commit();
                
                // Clear current sessions
                const sessionsSnapshot = await this.db.collection('current_sessions').get();
                const sessionsBatch = this.db.batch();
                sessionsSnapshot.docs.forEach(doc => {
                    sessionsBatch.delete(doc.ref);
                });
                await sessionsBatch.commit();
            } else {
                // Clear local data
                this.locations = [];
                this.employees = [];
            }
            
            // Reload views
            this.renderLocations();
            this.renderEmployees();
            
            this.showToast('Todos los datos han sido eliminados correctamente', 'success');
            
        } catch (error) {
            console.error('Error limpiando datos:', error);
            this.showToast('Error al limpiar datos: ' + error.message, 'error');
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// Inicializar panel de administración
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Funciones de utilidad para debugging
window.adminDebug = {
    showAllSections: () => {
        ['locations', 'employees', 'settings'].forEach((section, index) => {
            setTimeout(() => {
                window.adminPanel.showSection(section);
            }, index * 1000);
        });
    },
    
    addSampleData: () => {
        // Añadir datos de ejemplo para pruebas
        const sampleLocation = {
            id: 'local_sample',
            name: 'Local de Prueba',
            address: 'Calle de Prueba 123',
            phone: '+1234567899',
            image: 'resources/office-1.jpg',
            active: true,
            createdAt: new Date()
        };
        
        const sampleEmployee = {
            id: 'emp_sample',
            name: 'Empleado de Prueba',
            email: 'prueba@empresa.com',
            phone: '+1234567899',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            position: 'Tester',
            active: true,
            createdAt: new Date()
        };
        
        window.adminPanel.locations.push(sampleLocation);
        window.adminPanel.employees.push(sampleEmployee);
        
        window.adminPanel.renderLocations();
        window.adminPanel.renderEmployees();
        
        window.adminPanel.showToast('Datos de ejemplo añadidos', 'success');
    }
};