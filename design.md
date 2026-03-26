# Sistema de Gestión de Asistencia - Diseño

## Arquitectura del Sistema

### Base de Datos Firestore
- **employees**: Información de empleados (nombre, email, teléfono, activo)
- **locations**: Información de locales (nombre, dirección, teléfono, activo)
- **attendance**: Registros de asistencia (empleado, local, entrada, salida, fecha)
- **current_sessions**: Sesiones activas (empleado, local, hora_entrada, estado)

### Estructura de la Aplicación

#### 1. Página Principal (index.html)
- **Selector de Local**: Dropdown para elegir el local de trabajo
- **Panel Izquierdo**: Lista de empleados disponibles con botones de entrada/salida
- **Panel Derecho**: Empleados activos en el local actual
- **Estadísticas en tiempo real**: Contadores de empleados activos por local

#### 2. Panel de Administración (admin.html)
- **Gestión de Locales**: CRUD completo de locales
- **Gestión de Empleados**: CRUD completo de empleados
- **Asignación de Empleados**: Vincular empleados a locales específicos
- **Configuración del Sistema**: Horarios, permisos, notificaciones

#### 3. Dashboard de Control (dashboard.html)
- **Vista General**: Todos los locales con empleados activos
- **Monitor en Tiempo Real**: Actualizaciones automáticas de entradas/salidas
- **Alertas y Notificaciones**: Empleados sin fichar, horas extras
- **Reportes Rápidos**: Estadísticas del día, semana, mes

#### 4. Reportes (reports.html)
- **Filtros Avanzados**: Por fecha, local, empleado
- **Vista de Registros**: Tabla completa con horas trabajadas
- **Exportación**: Imprimir o descargar reportes en PDF
- **Análisis de Tendencias**: Gráficos de asistencia

## Diseño Visual

### Paleta de Colores
- **Primario**: Azul corporativo (#2563eb)
- **Secundario**: Verde éxito (#16a34a)
- **Advertencia**: Naranja (#ea580c)
- **Error**: Rojo (#dc2626)
- **Fondo**: Gris claro (#f8fafc)
- **Texto**: Gris oscuro (#1e293b)

### Tipografía
- **Encabezados**: Inter (sans-serif moderna)
- **Cuerpo**: System fonts (para mejor rendimiento)
- **Monospace**: Para horas y números

### Componentes UI
- **Cards**: Diseño limpio con sombras sutiles
- **Botones**: Estados claros (hover, active, disabled)
- **Tablas**: Ordenables y con búsqueda
- **Modales**: Para acciones de confirmación
- **Notificaciones**: Toast messages para feedback

## Funcionalidades Especiales

### Sistema de Fichaje
- **Entrada**: Un clic para registrar entrada con timestamp
- **Salida**: Un clic para registrar salida y calcular horas
- **Validación**: Prevenir doble registro en el mismo día
- **Ubicación**: Opcional - geolocalización del dispositivo

### Control en Tiempo Real
- **WebSockets**: Actualizaciones instantáneas
- **Estados**: Empleado activo/inactivo/pausa
- **Alertas**: Notificaciones para administradores
- **Sincronización**: Multi-dispositivo compatible

### Reportes y Análisis
- **Horas Trabajadas**: Cálculo automático con breaks
- **Horas Extra**: Detección y reporte
- **Asistencia**: Porcentajes de puntualidad
- **Locales**: Comparación de productividad

## Seguridad y Permisos
- **Roles**: Admin, Manager, Employee
- **Autenticación**: Firebase Auth integrado
- **Auditoría**: Log de todos los cambios
- **Backup**: Exportación periódica de datos