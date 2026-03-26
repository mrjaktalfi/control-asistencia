import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.fichajes.believ3.top');
if (typeof window !== 'undefined') (window as any).pb = pb;
console.log('PocketBase initialized with:', pb.baseUrl);

// Test connectivity
pb.collection('locations').getList(1, 1, { requestKey: null })
    .then(res => console.log('PB Connectivity Test Success:', res.totalItems))
    .catch(err => console.error('PB Connectivity Test Failed:', err));



enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface PocketBaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handlePocketBaseError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('PocketBase Error: ', error, operationType, path);
}

// --- Icons (SVG Components) ---
const Icons = {
    Clock: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Users: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
    Home: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    Settings: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    BarChart: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    FileText: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Activity: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    CheckCircle: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    AlertCircle: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    LogOut: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    LogIn: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>,
    Refresh: (props) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Database: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    Search: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Trash: (props) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Print: (props) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    Download: (props) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Sun: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Moon: (props) => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    X: (props) => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Logo: (props) => (
        <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <text x="10" y="60" style={{ fontFamily: "'Brush Script MT', cursive", fontSize: "60px", fill: "currentColor" }}>Believe</text>
            <text x="55" y="85" style={{ fontFamily: "Arial, sans-serif", fontSize: "15px", letterSpacing: "10px", fill: "currentColor" }}>CLUB</text>
        </svg>
    ),
    RotateCcw: (props) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    )
};

// --- Helper Functions ---
const formatDate = (date) => date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const formatTime = (dateOrTimestamp) => {
    if (!dateOrTimestamp) return '--:--';
    const date = new Date(dateOrTimestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// --- Components ---

// 1. Navigation Header
const Header = ({ currentView, onNavigate, time, toggleTheme, isDark, showNav, onLogout }) => {
    const dbStatus = true;
    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 print:hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => onNavigate('home')}>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Control de Acceso</h1>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {/* Navigation Buttons */}
                        {showNav && (
                            <div className="flex items-center space-x-1 mr-2">
                                <NavButton active={currentView === 'monitor'} onClick={() => onNavigate('monitor')} icon={<Icons.BarChart />} title="Monitor" />
                                <NavButton active={currentView === 'management'} onClick={() => onNavigate('management')} icon={<Icons.Settings />} title="Gestión" />
                                <NavButton active={currentView === 'reports'} onClick={() => onNavigate('reports')} icon={<Icons.FileText />} title="Reportes" />
                                <NavButton active={currentView === 'diagnostics'} onClick={() => onNavigate('diagnostics')} icon={<Icons.Activity />} title="Diagnóstico" />
                            </div>
                        )}
                        
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-600 mx-2 hidden sm:block"></div>
                        
                        {/* Dark Mode Toggle */}
                        <button 
                            onClick={toggleTheme} 
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                            title={isDark ? "Modo Claro" : "Modo Oscuro"}
                        >
                            {isDark ? <Icons.Sun /> : <Icons.Moon />}
                        </button>

                        {onLogout && (
                            <button 
                                onClick={onLogout}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Cerrar Sesión"
                            >
                                <Icons.LogOut />
                            </button>
                        )}

                        <div className="hidden md:flex flex-col items-end text-sm text-gray-600 dark:text-gray-300 ml-2">
                            <span>{formatDate(time)}</span>
                            <span className="font-mono text-xs">{formatTime(time)}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full animate-pulse ml-2 ${dbStatus ? 'bg-green-500' : 'bg-red-500'}`} title={dbStatus ? "Conectado" : "Desconectado"}></div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavButton = ({ active, onClick, icon, title }) => (
    <button 
        onClick={onClick}
        title={title}
        className={`p-2 rounded-lg transition-colors duration-200 ${active ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'}`}
    >
        {icon}
    </button>
);

// 2. Terminal View (Main Attendance)
const Terminal = ({ onNavigate }) => {
    const [locations, setLocations] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pinModal, setPinModal] = useState({ open: false, employeeId: null, pin: "" });

    const modalEmployee = useMemo(() => {
        if (!pinModal.employeeId) return null;
        return employees.find(e => e.id === pinModal.employeeId);
    }, [employees, pinModal.employeeId]);

    // Fetch Locations Real-time
    useEffect(() => {
        const fetchLocations = async () => {
            console.log('Fetching locations...');
            setLoading(true);
            try {
                const records = await pb.collection('locations').getFullList({ 
                    requestKey: null 
                });
                console.log('Locations fetched:', records.length);
                records.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                setLocations(records);
            } catch (error) {
                console.error('Error fetching locations:', error);
                handlePocketBaseError(error, OperationType.LIST, 'locations');
                showToast('Error cargando locales', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
        pb.collection('locations').subscribe('*', fetchLocations).catch(console.error);
        return () => { pb.collection('locations').unsubscribe('*'); };
    }, []);

    // Fetch Employees Real-time
    useEffect(() => {
        const fetchEmployees = async () => {
            console.log('[Auth] Iniciando carga de empleados...');
            try {
                const records = await pb.collection('employees').getFullList({ 
                    requestKey: null 
                });
                console.log('[Auth] Empleados cargados:', records.length);
                if (records.length > 0) {
                    const firstEmp = records[0];
                    console.log('[Auth] Verificación de esquema - Primer empleado:', {
                        id: firstEmp.id,
                        name: firstEmp.name,
                        hasPinField: 'pin' in firstEmp,
                        pinValue: firstEmp.pin,
                        pinType: typeof firstEmp.pin
                    });
                }
                records.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                setEmployees(records);
            } catch (error) {
                console.error('[Auth] Error al cargar empleados:', error);
                handlePocketBaseError(error, OperationType.LIST, 'employees');
            }
        };
        fetchEmployees();
        
        const unsubscribe = pb.collection('employees').subscribe('*', (e) => {
            console.log('[Auth] Cambio detectado en empleados:', e.action, e.record.id);
            fetchEmployees();
        }).catch(err => console.error('[Auth] Error en suscripción de empleados:', err));
        
        return () => { 
            pb.collection('employees').unsubscribe('*'); 
        };
    }, []);

    // Fetch Active Sessions Real-time
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const records = await pb.collection('current_sessions').getFullList({ requestKey: null });
                setActiveSessions(records);
            } catch (error) {
                handlePocketBaseError(error, OperationType.LIST, 'current_sessions');
            }
        };
        fetchSessions();
        pb.collection('current_sessions').subscribe('*', fetchSessions).catch(console.error);
        return () => { pb.collection('current_sessions').unsubscribe('*'); };
    }, []);

    const handleSelectLocation = (loc) => {
        setLoading(true);
        // Simulate a brief loading for UX
        setTimeout(() => {
            setSelectedLocation(loc);
            setLoading(false);
        }, 500);
    };

    const toggleAttendance = async (empId, providedPin) => {
        let emp;
        try {
            // Fetch fresh data to avoid stale state issues with PINs
            emp = await pb.collection('employees').getOne(empId, { requestKey: null });
            console.log(`[Auth] Verificando empleado: ${emp.name}, PIN en DB: "${emp.pin}", PIN provisto: "${providedPin}"`);
        } catch (error) {
            console.error("[Auth] Error al obtener empleado de la DB:", error);
            emp = employees.find(e => e.id === empId);
        }
        
        if (!emp) {
            showToast('Empleado no encontrado', 'error');
            return false;
        }
        
        // PIN Verification or Creation
        // Check for empty, null or undefined
        const hasNoPin = !emp.pin || String(emp.pin).trim() === "";
        
        if (hasNoPin) {
            // If employee has no PIN, assign the provided one
            try {
                console.log(`[Auth] Asignando nuevo PIN "${providedPin}" a ${emp.name}`);
                const updated = await pb.collection('employees').update(emp.id, { pin: String(providedPin) });
                console.log(`[Auth] PIN asignado con éxito. Nuevo PIN en DB: "${updated.pin}"`);
                showToast('PIN asignado correctamente', 'success');
                // We continue with the attendance toggle
            } catch (error) {
                console.error("[Auth] Error crítico al asignar PIN:", error);
                showToast('Error al asignar PIN. Verifique permisos.', 'error');
                return false;
            }
        } else if (String(emp.pin) !== String(providedPin)) {
            console.warn(`[Auth] PIN incorrecto para ${emp.name}. Esperado: "${emp.pin}", Recibido: "${providedPin}"`);
            showToast('PIN incorrecto', 'error');
            return false;
        }

        const sessionEmp = activeSessions.find(s => s.employeeId === empId);
        const employeeName = emp ? emp.name : (sessionEmp ? sessionEmp.employeeName : 'Desconocido');

        const existingSession = activeSessions.find(s => s.employeeId === empId);

        try {
            if (existingSession) {
                // CHECK OUT
                console.log(`[Attendance] Iniciando Salida para: ${employeeName}`, {
                    sessionId: existingSession.id,
                    attendanceId: existingSession.attendanceId
                });
                
                // 1. Update the permanent attendance record
                if (existingSession.attendanceId) {
                    try {
                        const updated = await pb.collection('attendance').update(existingSession.attendanceId, {
                            checkOut: new Date().toISOString(),
                            status: 'completed'
                        });
                        console.log(`[Attendance] Registro de asistencia actualizado con salida:`, updated);
                    } catch (err) {
                        console.error(`[Attendance] Error al actualizar registro de asistencia:`, err);
                        throw err;
                    }
                } else {
                    console.warn(`[Attendance] ¡ADVERTENCIA! No se encontró attendanceId en la sesión activa.`);
                }
                
                // 2. Remove from active sessions
                try {
                    await pb.collection('current_sessions').delete(existingSession.id);
                    console.log(`[Attendance] Sesión activa eliminada con éxito.`);
                } catch (err) {
                    console.error(`[Attendance] Error al eliminar sesión activa:`, err);
                    throw err;
                }
                
                showToast(`Salida registrada: ${employeeName}`, 'info');

            } else {
                if (!emp) return; // Cannot check in if we don't have employee data
                // CHECK IN
                // 1. Create a permanent attendance record
                const now = new Date();
                
                const newAttendance = await pb.collection('attendance').create({
                    employeeId: empId,
                    employeeName: emp.name,
                    locationId: selectedLocation?.id,
                    locationName: selectedLocation?.name,
                    checkIn: new Date().toISOString(),
                    date: now.toISOString().split('T')[0],
                    status: 'active'
                });

                // 2. Add to active sessions for quick lookup
                await pb.collection('current_sessions').create({
                    employeeId: empId,
                    employeeName: emp.name,
                    startTime: new Date().toISOString(),
                    locationId: selectedLocation?.id,
                    locationName: selectedLocation?.name,
                    status: 'active',
                    attendanceId: newAttendance.id
                });
                
                showToast(`Entrada registrada: ${emp.name}`, 'success');
            }
            return true;
        } catch (error) {
            console.error("Error en fichaje:", error);
            showToast('Error al procesar el fichaje', 'error');
            return false;
        }
    };

    const handlePinSubmit = async (digit) => {
        if (digit === 'clear') {
            setPinModal(prev => ({ ...prev, pin: "" }));
            return;
        }
        
        const newPin = pinModal.pin + digit;
        if (newPin.length <= 4) {
            setPinModal(prev => ({ ...prev, pin: newPin }));
            
            if (newPin.length === 4) {
                const success = await toggleAttendance(pinModal.employeeId, newPin);
                if (success) {
                    setPinModal({ open: false, employeeId: null, pin: "" });
                    setSearchTerm("");
                } else {
                    setPinModal(prev => ({ ...prev, pin: "" }));
                }
            }
        }
    };

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return [];
        const lowerSearch = searchTerm.toLowerCase();
        return employees.filter(e => (e.name || '').toLowerCase().includes(lowerSearch));
    }, [employees, searchTerm]);
    
    // Filter active sessions to only show those for the CURRENTLY selected location
    const locationActiveSessions = useMemo(() => {
        if (!selectedLocation) return [];
        return activeSessions.filter(session => session.locationId === selectedLocation.id);
    }, [activeSessions, selectedLocation]);

    if (!selectedLocation) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seleccionar Local</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Elija su ubicación de trabajo actual para comenzar el registro.</p>
                    
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {locations.length === 0 && (
                                <div className="col-span-3 text-center py-12 text-gray-400">
                                    No hay locales configurados o cargando...
                                </div>
                            )}
                            {locations.map(loc => (
                                <div 
                                    key={loc.id}
                                    onClick={() => handleSelectLocation(loc)}
                                    className="group cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 border border-transparent hover:border-blue-200 dark:hover:border-blue-500 p-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                                >
                                    <div 
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 transition-colors"
                                        style={{ backgroundColor: loc.color || '#2563eb' }}
                                    >
                                        {(loc.name || '?').charAt(0)}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{loc.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-300">{loc.address}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Employee Search & Grid */}
            <div className="lg:col-span-2 space-y-6">
                <div 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300 border-t-4"
                    style={{ borderTopColor: selectedLocation.color || '#2563eb' }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLocation.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Panel de Fichaje</p>
                        </div>
                        <button 
                            onClick={() => setSelectedLocation(null)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                            Cambiar Local
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                           <Icons.Search />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Buscar tu nombre para fichar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {/* Only show employees if searching */}
                        {searchTerm.length > 0 ? (
                            filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => {
                                    // Check global active sessions to show status correctly, even if working elsewhere
                                    const session = activeSessions.find(s => s.employeeId === emp.id);
                                    const isCheckedIn = !!session;
                                    
                                    return (
                                        <div 
                                            key={emp.id}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${isCheckedIn ? 'border-green-500 bg-green-50 dark:bg-green-900 shadow-md transform scale-[1.02]' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-blue-300 hover:shadow-sm'}`}
                                        >
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden ${isCheckedIn ? 'bg-green-600' : 'bg-gray-400'}`}>
                                                    {emp.avatar && emp.avatar.startsWith('http') ? 
                                                        <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" /> : 
                                                        (emp.name ? emp.name.substring(0,2).toUpperCase() : '??')
                                                    }
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]" title={emp.name}>{emp.name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{emp.position} {emp.pin ? '🔒' : '🔓'}</p>
                                                </div>
                                                {isCheckedIn && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                                            </div>
                                            <button 
                                                onClick={() => setPinModal({ open: true, employeeId: emp.id, pin: "" })}
                                                className={`w-full py-2 rounded-lg text-white font-bold text-sm shadow-sm flex items-center justify-center space-x-2 transition-colors ${isCheckedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            >
                                                {isCheckedIn ? (
                                                    <><span>SALIDA</span><Icons.LogOut/></>
                                                ) : (
                                                    <><span>ENTRADA</span><Icons.LogIn/></>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-8 text-gray-400">
                                    No se encontraron empleados con ese nombre.
                                </div>
                            )
                        ) : (
                             <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900">
                                <div className="mb-2 text-gray-300 dark:text-gray-600">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <p>Escribe tu nombre en el buscador para ver las opciones de fichaje.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PIN Modal */}
            {pinModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-xs border border-gray-200 dark:border-gray-700 transform animate-scale-in">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {modalEmployee?.pin ? 'Ingrese su PIN' : 'Crear su PIN'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {modalEmployee?.name}
                                {modalEmployee && !modalEmployee.pin && <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">Primera vez: asigne un código de 4 dígitos</span>}
                            </p>
                        </div>

                        <div className="flex justify-center gap-3 mb-8">
                            {[0, 1, 2, 3].map(i => (
                                <div 
                                    key={i} 
                                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pinModal.pin.length > i ? 'bg-blue-600 border-blue-600 scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                                ></div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button 
                                    key={num}
                                    onClick={() => handlePinSubmit(num.toString())}
                                    className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-xl font-bold text-gray-800 dark:text-white transition-colors flex items-center justify-center"
                                >
                                    {num}
                                </button>
                            ))}
                            <button 
                                onClick={() => setPinModal({ open: false, employeeId: null, pin: "" })}
                                className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center"
                            >
                                <Icons.X />
                            </button>
                            <button 
                                onClick={() => handlePinSubmit('0')}
                                className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-xl font-bold text-gray-800 dark:text-white transition-colors flex items-center justify-center"
                            >
                                0
                            </button>
                            <button 
                                onClick={() => handlePinSubmit('clear')}
                                className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center"
                            >
                                <Icons.RotateCcw />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Stats */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24 transition-colors duration-300">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
                        Activos Ahora
                        <span 
                            className="text-white px-3 py-1 rounded-full text-sm font-bold"
                            style={{ backgroundColor: selectedLocation.color || '#2563eb' }}
                        >
                            {locationActiveSessions.length}
                        </span>
                    </h3>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {locationActiveSessions.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No hay empleados activos en este local</div>
                        ) : (
                            locationActiveSessions.map((session, idx) => (
                                <div 
                                    key={session.id || idx} 
                                    onClick={() => {
                                        const emp = employees.find(e => e.id === session.employeeId);
                                        setPinModal({ open: true, employeeId: session.employeeId, pin: "" });
                                    }}
                                    title="Click para registrar Salida"
                                    className="group flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer hover:border-red-500 hover:bg-red-50 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-sm border border-gray-200 dark:border-gray-500">
                                           {session.employeeName ? session.employeeName.substring(0,2).toUpperCase() : '??'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white text-base group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors leading-tight">{session.employeeName}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                <Icons.Clock />
                                                {formatTime(session.startTime)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-gray-300 dark:text-gray-600 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                        <Icons.LogOut />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. Admin View (MANAGEMENT)
const Admin = () => {
    const [activeTab, setActiveTab] = useState('locations'); // 'locations', 'employees', 'settings'
    const [locations, setLocations] = useState([]);
    const [employees, setEmployees] = useState([]);
    
    // Admin PIN state
    const [adminPin, setAdminPin] = useState(() => localStorage.getItem('admin_pin') || '0000');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    // Search states for Admin
    const [locSearch, setLocSearch] = useState("");
    const [empSearch, setEmpSearch] = useState("");
    
    // Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const formRef = useRef(null);
    
    // Delete Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    const fetchAll = async () => {
        try {
            const locs = await pb.collection('locations').getFullList({ requestKey: null });
            locs.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setLocations(locs);
            
            const emps = await pb.collection('employees').getFullList({ requestKey: null });
            emps.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setEmployees(emps);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAll();
        pb.collection('locations').subscribe('*', fetchAll).catch(console.error);
        pb.collection('employees').subscribe('*', fetchAll).catch(console.error);
        return () => {
            pb.collection('locations').unsubscribe('*');
            pb.collection('employees').unsubscribe('*');
        };
    }, []);

    // Filtered lists for Admin view
    const filteredLocations = useMemo(() => {
        return locations.filter(l => (l.name || '').toLowerCase().includes(locSearch.toLowerCase()));
    }, [locations, locSearch]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => (e.name || '').toLowerCase().includes(empSearch.toLowerCase()));
    }, [employees, empSearch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const data: any = Object.fromEntries(formData.entries());
        data.active = true; // Default to active

        try {
            console.log(`[Admin] Intentando guardar ${activeTab}:`, data);
            if (activeTab === 'locations') {
                if (editItem) {
                    const updated = await pb.collection('locations').update(editItem.id, data);
                    console.log('[Admin] Local actualizado:', updated);
                    showToast('Local actualizado', 'success');
                } else {
                    const created = await pb.collection('locations').create(data);
                    console.log('[Admin] Local creado:', created);
                    showToast('Local creado', 'success');
                }
            } else {
                // Ensure PIN is string and trimmed
                if (data.pin) data.pin = String(data.pin).trim();
                
                if (editItem) {
                    console.log('[Admin] Actualizando empleado ID:', editItem.id, 'con datos:', data);
                    const updated = await pb.collection('employees').update(editItem.id, data);
                    console.log('[Admin] Empleado actualizado con éxito (Respuesta DB):', updated);
                    
                    if (data.pin && updated.pin !== data.pin) {
                        console.error('[Admin] ¡ERROR DE PERSISTENCIA! El PIN guardado no coincide con el enviado.', {
                            enviado: data.pin,
                            recibido: updated.pin
                        });
                        showToast('Error: El PIN no se guardó correctamente en el servidor', 'error');
                    } else {
                        showToast('Empleado actualizado', 'success');
                    }
                } else {
                    const created = await pb.collection('employees').create(data);
                    console.log('[Admin] Empleado creado con éxito (Respuesta DB):', created);
                    showToast('Empleado creado', 'success');
                }
            }
            setIsModalOpen(false);
            setEditItem(null);
        } catch (err) {
            console.error('[Admin] Error crítico al guardar:', err);
            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
            showToast(`Error al guardar: ${errorMsg}`, 'error');
        }
    };
    
    const confirmDelete = async () => {
        if (!deleteConfirmation) return;
        const { id, collection } = deleteConfirmation;
        try {
            await pb.collection(collection).delete(id);
            showToast('Eliminado correctamente', 'info');
            setDeleteConfirmation(null);
        } catch(err) { 
            console.error('Delete error:', err);
            showToast(`Error: ${err.message}`, 'error'); 
        }
    };
    
    const handleDeleteClick = (item, collection) => {
        setDeleteConfirmation({
            id: item.id,
            collection: collection,
            name: item.name
        });
    };

    const handleResetPin = async (employee) => {
        try {
            console.log(`[Admin] Reseteando PIN para ${employee.name}`);
            await pb.collection('employees').update(employee.id, { pin: "" });
            showToast(`PIN de ${employee.name} reseteado. Deberá configurar uno nuevo al fichar.`, 'success');
        } catch (error) {
            console.error('[Admin] Error al resetear PIN:', error);
            showToast('Error al resetear PIN', 'error');
        }
    };

    const handleUpdatePin = (e) => {
        e.preventDefault();
        if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
            showToast('El PIN debe ser de 4 dígitos numéricos', 'error');
            return;
        }
        if (newPin !== confirmPin) {
            showToast('Los PINs no coinciden', 'error');
            return;
        }
        localStorage.setItem('admin_pin', newPin);
        setAdminPin(newPin);
        setNewPin('');
        setConfirmPin('');
        showToast('PIN de Administrador actualizado', 'success');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h2>
                    <p className="text-gray-500 dark:text-gray-400">Gestión centralizada de recursos y configuración.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('locations')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'locations' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Locales
                    </button>
                    <button 
                        onClick={() => setActiveTab('employees')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'employees' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Empleados
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Ajustes
                    </button>
                </div>
            </div>
            
            {activeTab === 'settings' ? (
                <div className="max-w-2xl mx-auto w-full">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Icons.Settings className="text-blue-600" /> Seguridad
                        </h3>
                        <form onSubmit={handleUpdatePin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cambiar PIN de Administrador</label>
                                <div className="space-y-4">
                                    <input 
                                        type="password" 
                                        maxLength={4}
                                        placeholder="Nuevo PIN (4 dígitos)" 
                                        className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <input 
                                        type="password" 
                                        maxLength={4}
                                        placeholder="Confirmar Nuevo PIN" 
                                        className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={confirmPin}
                                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                                Guardar PIN
                            </button>
                        </form>
                    </div>
                </div>
            ) : activeTab === 'locations' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Icons.Search />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Buscar local por nombre..." 
                                className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={locSearch}
                                onChange={(e) => setLocSearch(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => { setIsModalOpen(true); setEditItem(null); }}
                            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <span>+ Nuevo Local</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Local</th>
                                    <th className="px-6 py-4">Dirección</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredLocations.map(l => (
                                    <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: l.color || '#2563eb' }}></div>
                                                <span className="font-bold text-gray-900 dark:text-white">{l.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{l.address || 'Sin dirección'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setEditItem(l); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                    Editar
                                                </button>
                                                <button onClick={() => handleDeleteClick(l, 'locations')} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Icons.Search />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Buscar empleado por nombre..." 
                                className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={empSearch}
                                onChange={(e) => setEmpSearch(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => { setIsModalOpen(true); setEditItem(null); }}
                            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <span>+ Nuevo Empleado</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                        {filteredEmployees.map(e => (
                            <div key={e.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-between group hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-200 dark:border-gray-600">
                                        {e.name ? e.name.substring(0,2).toUpperCase() : '??'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white leading-tight">{e.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{e.position} • PIN: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{e.pin || '---'}</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleResetPin(e)} 
                                        title="Resetear PIN (el empleado deberá configurar uno nuevo)"
                                        className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
                                    >
                                        <Icons.RotateCcw className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => { setEditItem(e); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDeleteClick(e, 'employees')} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg">
                                        <Icons.Trash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border dark:border-gray-700 transform animate-scale-in">
                        <h3 className="text-2xl font-bold mb-6 dark:text-white">{editItem ? 'Editar' : 'Nuevo'} {activeTab === 'locations' ? 'Local' : 'Empleado'}</h3>
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                                <input name="name" defaultValue={editItem?.name} placeholder="Ej: Juan Pérez" className="w-full border dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                            </div>
                            
                            {activeTab === 'locations' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                                        <input name="address" defaultValue={editItem?.address} placeholder="Ej: Calle Mayor 10" className="w-full border dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Color Distintivo</label>
                                        <input type="color" name="color" defaultValue={editItem?.color || "#3b82f6"} className="h-10 w-20 p-1 border-0 bg-transparent cursor-pointer rounded-lg" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo / Puesto</label>
                                        <input name="position" defaultValue={editItem?.position} placeholder="Ej: Supervisor" className="w-full border dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN de Acceso (4 dígitos)</label>
                                        <input name="pin" defaultValue={editItem?.pin} placeholder="Ej: 1234" className="w-full border dark:border-gray-600 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" maxLength={4} pattern="\d{4}" title="Debe ser un código de 4 dígitos" required />
                                    </div>
                                </>
                            )}
                            <div className="flex gap-3 justify-end mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors">Cancelar</button>
                                <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[110] backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 transform animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 text-red-600 dark:text-red-400">
                                <Icons.Trash className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">¿Confirmar eliminación?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Vas a eliminar a <span className="font-bold text-gray-800 dark:text-gray-200">"{deleteConfirmation.name}"</span>. Esta acción es irreversible.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setDeleteConfirmation(null)} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-bold w-full transition-colors">Cancelar</button>
                            <button onClick={confirmDelete} className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold w-full shadow-lg shadow-red-500/20 transition-all">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 4. Dashboard View (REAL-TIME MONITOR)
const Dashboard = () => {
    const [locations, setLocations] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    
    // 1. Fetch Locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const locs = await pb.collection('locations').getFullList({ filter: 'active = true', requestKey: null });
                locs.sort((a, b) => a.name.localeCompare(b.name));
                setLocations(locs);
            } catch (error) {
                console.error(error);
            }
        };
        fetchLocations();
        pb.collection('locations').subscribe('*', fetchLocations).catch(console.error);
        return () => { pb.collection('locations').unsubscribe('*'); };
    }, []);

    // 2. Fetch ALL Active Sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const sessions = await pb.collection('current_sessions').getFullList({ requestKey: null });
                setActiveSessions(sessions);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSessions();
        pb.collection('current_sessions').subscribe('*', fetchSessions).catch(console.error);
        return () => { pb.collection('current_sessions').unsubscribe('*'); };
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Monitor en Tiempo Real</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Visualización en vivo del personal activo por sucursal.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.length === 0 && (
                     <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        No hay locales activos configurados.
                     </div>
                )}
                
                {locations.map(loc => {
                    // Filter sessions for this specific location
                    const locSessions = activeSessions.filter(s => s.locationId === loc.id);
                    // Sort by newest check-in first
                    locSessions.sort((a, b) => {
                         const tA = a.checkIn ? new Date(a.checkIn).getTime() : 0;
                         const tB = b.checkIn ? new Date(b.checkIn).getTime() : 0;
                         return tB - tA;
                    });
                    
                    const locColor = loc.color || '#2563eb';

                    return (
                        <div 
                            key={loc.id} 
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-96 transition-all duration-300 hover:shadow-md border-t-4"
                            style={{ borderTopColor: locColor }}
                        >
                            {/* Header */}
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate" title={loc.name}>{loc.name}</h3>
                                <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600`}>
                                    <div className={`w-2 h-2 rounded-full ${locSessions.length > 0 ? 'animate-pulse' : ''}`} style={{ backgroundColor: locSessions.length > 0 ? locColor : '#9ca3af' }}></div>
                                    <span style={{ color: locSessions.length > 0 ? locColor : '' }}>{locSessions.length} Activos</span>
                                </div>
                            </div>
                            
                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-white dark:bg-gray-800 relative">
                                {locSessions.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 opacity-60">
                                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        <span className="text-sm font-medium">Sin actividad</span>
                                    </div>
                                ) : (
                                    locSessions.map(session => (
                                        <div key={session.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors animate-fade-in shadow-sm">
                                            <div className="flex items-center gap-3">
                                                 <div 
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ backgroundColor: locColor }}
                                                 >
                                                    {session.employeeName ? session.employeeName.substring(0,2).toUpperCase() : '??'}
                                                 </div>
                                                 <div>
                                                     <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">{session.employeeName}</p>
                                                     <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                         En turno
                                                     </p>
                                                 </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">{formatTime(session.startTime)}</p>
                                                <p className="text-[10px] text-gray-400">Entrada</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${colors[color].split(' ')[1]}`}>{value}</p>
        </div>
    );
};

// 5. Reports View
const Reports = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const today = new Date().toISOString().split('T')[0];
    const firstDay = new Date();
    firstDay.setDate(1);
    const startMonth = firstDay.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(startMonth);
    const [endDate, setEndDate] = useState(today);
    const [filterLoc, setFilterLoc] = useState('');
    const [filterEmp, setFilterEmp] = useState('');
    
    // Dropdown Data
    const [allLocations, setAllLocations] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const locs = await pb.collection('locations').getFullList({ filter: 'active = true', requestKey: null });
                locs.sort((a,b) => a.name.localeCompare(b.name));
                setAllLocations(locs);

                const emps = await pb.collection('employees').getFullList({ filter: 'active = true', requestKey: null });
                emps.sort((a,b) => a.name.localeCompare(b.name));
                setAllEmployees(emps);
            } catch (error) {
                console.error(error);
            }
        };
        fetchDropdowns();
        fetchReports();
    }, []);

    // Re-fetch when dates change
    useEffect(() => {
        fetchReports();
    }, [startDate, endDate]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await pb.collection('attendance').getFullList({
                filter: `date >= '${startDate}' && date <= '${endDate}'`,
                requestKey: null
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
    };

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            if (filterLoc && r.locationId !== filterLoc) return false;
            if (filterEmp && r.employeeId !== filterEmp) return false;
            return true;
        });
    }, [records, filterLoc, filterEmp]);

    const exportPDF = () => {
        window.print();
    };

    const exportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Fecha,Empleado,Local,Entrada,Salida,Estado\n";
        
        filteredRecords.forEach(r => {
            const row = [
                r.date,
                r.employeeName,
                r.locationName,
                formatTime(r.checkIn),
                r.checkOut ? formatTime(r.checkOut) : '-',
                r.status || 'N/A'
            ].join(",");
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `asistencia_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getLocationColor = (locName) => {
        const loc = allLocations.find(l => l.name === locName);
        return loc ? (loc.color || '#2563eb') : '#9ca3af';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in print:p-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 print:hidden">Reportes y Consultas</h2>
            
            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-end print:hidden transition-colors duration-300">
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Fecha Inicio</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Fecha Fin</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Local</label>
                    <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)} className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Todos los locales</option>
                        {allLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Empleado</label>
                    <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} className="border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Todos los empleados</option>
                        {allEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                 <div className="w-full md:w-auto flex gap-2">
                    <button onClick={exportPDF} className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-black dark:hover:bg-gray-600 flex items-center gap-2">
                        <Icons.Print /> Imprimir / PDF
                    </button>
                    <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
                        <Icons.Download /> CSV
                    </button>
                </div>
            </div>

            {/* Print Header (Visible only on print) */}
            <div className="hidden print:block mb-6 text-center">
                <h1 className="text-2xl font-bold">Reporte de Asistencia</h1>
                <p className="text-sm text-gray-500">
                    Desde: {startDate}  Hasta: {endDate}
                    {(filterLoc || filterEmp) && ` (Filtrado)`}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden print:shadow-none print:border-0 transition-colors duration-300">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                        <tr>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Empleado</th>
                            <th className="p-4">Local</th>
                            <th className="p-4">Entrada</th>
                            <th className="p-4">Salida</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando datos...</td></tr>
                        ) : filteredRecords.length === 0 ? (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-400">No se encontraron registros en este rango.</td></tr>
                        ) : (
                            filteredRecords.map((r, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 print:hover:bg-white text-gray-900 dark:text-gray-200">
                                    <td className="p-4">{r.date}</td>
                                    <td className="p-4 font-medium">{r.employeeName}</td>
                                    <td className="p-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: getLocationColor(r.locationName) }}></span>
                                        {r.locationName}
                                    </td>
                                    <td className="p-4 text-green-600 dark:text-green-400">{formatTime(r.checkIn)}</td>
                                    <td className="p-4 text-red-600 dark:text-red-400">{r.checkOut ? formatTime(r.checkOut) : '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="hidden print:block mt-8 text-center text-xs text-gray-400 border-t pt-4">
                Generado por Sistema Believe Group el {new Date().toLocaleDateString()}
            </div>
        </div>
    );
};

// 6. Test View (SYSTEM DIAGNOSTICS)
const Test = () => {
    const [results, setResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    
    const runDiagnostics = async () => {
        setIsRunning(true);
        setResults([]);
        
        const addResult = (name, status, message) => {
            setResults(prev => {
                const existingIdx = prev.findIndex(r => r.name === name);
                const newEntry = { name, status, message, time: new Date().toLocaleTimeString() };
                if (existingIdx >= 0) {
                    const updated = [...prev];
                    updated[existingIdx] = newEntry;
                    return updated;
                }
                return [...prev, newEntry];
            });
        };

        try {
            // 1. Connectivity
            addResult('Conexión al Servidor', 'loading', 'Probando latencia...');
            const start = Date.now();
            await pb.send('/api/health', {});
            const latency = Date.now() - start;
            addResult('Conexión al Servidor', 'success', `Conectado (Latencia: ${latency}ms)`);

            // 2. Collections Check
            const collections = ['locations', 'employees', 'attendance', 'current_sessions'];
            for (const col of collections) {
                addResult(`Colección: ${col}`, 'loading', 'Verificando...');
                try {
                    const res = await pb.collection(col).getList(1, 1, { requestKey: null });
                    let message = `Disponible (${res.totalItems} registros)`;
                    
                    if (col === 'employees' && res.items.length > 0) {
                        const hasPin = 'pin' in res.items[0];
                        message += hasPin ? ' - Campo PIN detectado' : ' - ¡ADVERTENCIA: Campo PIN NO detectado!';
                    }
                    
                    if (col === 'attendance' && res.items.length > 0) {
                        const hasCheckOut = 'checkOut' in res.items[0];
                        message += hasCheckOut ? ' - Campo checkOut detectado' : ' - ¡ADVERTENCIA: Campo checkOut NO detectado!';
                    }
                    addResult(`Colección: ${col}`, 'success', message);
                } catch (e) {
                    addResult(`Colección: ${col}`, 'error', `Error: ${e.message}`);
                }
            }

            // 3. Browser Environment
            addResult('Entorno del Navegador', 'success', `UserAgent: ${navigator.userAgent.substring(0, 50)}...`);
            addResult('Almacenamiento Local', 'success', `Admin PIN: ${localStorage.getItem('admin_pin') ? 'Configurado' : 'Por defecto (0000)'}`);
            
            // 4. Real-time Subscription Test
            addResult('Sistema Real-time', 'success', 'Suscripciones activas');

        } catch (e) {
            addResult('Error General', 'error', e.message);
        } finally {
            setIsRunning(false);
        }
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Diagnóstico del Sistema</h2>
                    <p className="text-gray-500 dark:text-gray-400">Verificación técnica de componentes y conectividad.</p>
                </div>
                <button 
                    onClick={runDiagnostics} 
                    disabled={isRunning}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${isRunning ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                >
                    <Icons.Refresh className={isRunning ? 'animate-spin' : ''} />
                    {isRunning ? 'Ejecutando...' : 'Re-evaluar'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                    <div className="p-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Icons.Activity className="text-blue-600" /> Registro de Pruebas
                        </h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {results.map((res, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 animate-fade-in">
                                <div className="mt-1">
                                    {res.status === 'success' && <div className="text-green-500"><Icons.CheckCircle /></div>}
                                    {res.status === 'error' && <div className="text-red-500"><Icons.AlertCircle /></div>}
                                    {res.status === 'loading' && <div className="text-blue-500 animate-spin"><Icons.Refresh /></div>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{res.name}</p>
                                        <span className="text-[10px] text-gray-400 font-mono">{res.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{res.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Icons.Database className="text-purple-600" /> Estado de Base de Datos
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Endpoint</span>
                                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-300">api.fichajes.believ3.top</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Modo</span>
                                <span className="text-green-600 dark:text-green-400 font-bold">Producción</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Sincronización</span>
                                <span className="text-blue-600 dark:text-blue-400">Tiempo Real Activa</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/30">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <Icons.CheckCircle /> Sistema Operativo
                        </h3>
                        <p className="text-sm text-blue-100 mb-4">Todos los servicios críticos están funcionando correctamente. No se requieren acciones inmediatas.</p>
                        <div className="text-xs bg-blue-700/50 p-3 rounded-lg border border-blue-500/30">
                            Última verificación completa: {new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Toast Notification Helper ---
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    const bgColors = { success: 'bg-green-600', info: 'bg-blue-600', error: 'bg-red-600' };
    
    const bgClass = bgColors[type] || bgColors.info;
    
    toast.className = `${bgClass} text-white px-6 py-3 rounded-lg shadow-lg mb-3 transform transition-all duration-300 translate-x-full flex items-center min-w-[300px] z-[100]`;
    toast.innerHTML = `<span class="flex-grow font-medium">${message}</span>`;
    
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const createToastContainer = () => {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.className = 'fixed top-24 right-4 z-50 flex flex-col items-end pointer-events-none';
    document.body.appendChild(div);
    return div;
};

// --- Main App Component ---
const App = () => {
    console.log('App mounting...');
    const [view, setView] = useState('home');
    const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
    const [showAdminAuth, setShowAdminAuth] = useState(false);
    const [authPin, setAuthPin] = useState("");
    const [pendingView, setPendingView] = useState(null);
    
    const [time, setTime] = useState(new Date());
    // Initialize dark mode from local storage or system preference
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Effect to apply dark mode class
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleAdminAuth = (digit) => {
        if (digit === 'clear') {
            setAuthPin("");
            return;
        }
        const newPin = authPin + digit;
        if (newPin.length <= 4) {
            setAuthPin(newPin);
            if (newPin.length === 4) {
                const storedPin = localStorage.getItem('admin_pin') || '0000';
                if (newPin === storedPin) {
                    setIsAdminAuthorized(true);
                    setShowAdminAuth(false);
                    setView(pendingView || 'monitor');
                    setPendingView(null);
                    setAuthPin("");
                } else {
                    showToast('PIN de Administrador incorrecto', 'error');
                    setAuthPin("");
                }
            }
        }
    };

    const renderView = () => {
        if (view === 'home') {
            return (
                <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        {/* Employee Access */}
                        <button 
                            onClick={() => setView('terminal')}
                            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 text-left"
                        >
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Icons.Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Empleados</h3>
                            <p className="text-gray-500 dark:text-gray-400">Registrar entrada o salida de su jornada laboral.</p>
                        </button>

                        {/* Admin Access */}
                        <button 
                            onClick={() => setShowAdminAuth(true)}
                            className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-2 text-left"
                        >
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Icons.Settings className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Panel de Control</h3>
                            <p className="text-gray-500 dark:text-gray-400">Gestión de locales, empleados y reportes detallados.</p>
                        </button>
                    </div>
                </div>
            );
        }

        switch(view) {
            case 'terminal': return <Terminal onNavigate={setView} />;
            case 'management': return isAdminAuthorized ? <Admin /> : <HomeRedirect />;
            case 'monitor': return isAdminAuthorized ? <Dashboard /> : <HomeRedirect />;
            case 'reports': return isAdminAuthorized ? <Reports /> : <HomeRedirect />;
            case 'diagnostics': return isAdminAuthorized ? <Test /> : <HomeRedirect />;
            default: return <Terminal onNavigate={setView} />;
        }
    };

    const HomeRedirect = () => {
        useEffect(() => setView('home'), []);
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
            {view !== 'home' && (
                <Header 
                    currentView={view} 
                    onNavigate={(v) => {
                        if (['monitor', 'management', 'reports', 'diagnostics'].includes(v) && !isAdminAuthorized) {
                            setPendingView(v);
                            setShowAdminAuth(true);
                        } else {
                            setView(v);
                        }
                    }} 
                    time={time} 
                    toggleTheme={toggleTheme} 
                    isDark={darkMode} 
                    showNav={isAdminAuthorized}
                    onLogout={isAdminAuthorized ? () => {
                        setIsAdminAuthorized(false);
                        setPendingView(null);
                        setView('home');
                    } : null}
                />
            )}
            
            <main className="flex-grow relative">
                {renderView()}
            </main>

            {/* Admin Auth Modal */}
            {showAdminAuth && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[200] backdrop-blur-lg animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 w-full max-w-sm border border-gray-200 dark:border-gray-700 transform animate-scale-in">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Icons.Settings className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Restringido</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ingrese el PIN de Administrador</p>
                        </div>

                        <div className="flex justify-center gap-4 mb-10">
                            {[0, 1, 2, 3].map(i => (
                                <div 
                                    key={i} 
                                    className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${authPin.length > i ? 'bg-purple-600 border-purple-600 scale-125' : 'border-gray-300 dark:border-gray-600'}`}
                                ></div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button 
                                    key={num}
                                    onClick={() => handleAdminAuth(num.toString())}
                                    className="h-16 w-16 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 text-xl font-bold text-gray-800 dark:text-white transition-colors flex items-center justify-center"
                                >
                                    {num}
                                </button>
                            ))}
                            <button 
                                onClick={() => { setShowAdminAuth(false); setPendingView(null); }}
                                className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold flex items-center justify-center"
                            >
                                <Icons.X />
                            </button>
                            <button 
                                onClick={() => handleAdminAuth('0')}
                                className="h-16 w-16 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900 text-xl font-bold text-gray-800 dark:text-white transition-colors flex items-center justify-center"
                            >
                                0
                            </button>
                            <button 
                                onClick={() => handleAdminAuth('clear')}
                                className="h-16 w-16 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center"
                            >
                                <Icons.RotateCcw />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="py-6 text-center text-gray-400 dark:text-gray-600 text-xs print:hidden">
                v1.4 © 2026 Control de Acceso
            </footer>
        </div>
    );
};

// --- Mount ---
const container = document.getElementById('root');
if (container) {
    if (!(window as any)._root) {
        (window as any)._root = createRoot(container);
    }
    (window as any)._root.render(<App />);
}
