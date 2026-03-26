# Estructura del Proyecto - Sistema de Asistencia

## Archivos Principales

### HTML Pages
- **index.html** - Página principal de fichaje de empleados
- **admin.html** - Panel de administración de locales y empleados  
- **dashboard.html** - Dashboard de control en tiempo real
- **reports.html** - Sistema de reportes y análisis

### JavaScript
- **main.js** - Lógica principal y configuración Firebase
- **firebase-config.js** - Configuración de Firebase (usando los datos proporcionados)

### Recursos
- **resources/** - Imágenes, iconos y assets
  - hero-bg.jpg - Imagen hero para landing
  - employee-avatars/ - Imágenes de empleados de ejemplo
  - location-images/ - Imágenes de locales

## Configuración Firebase

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCQATvoHqEPTgpenBNSav2uBNXjDn4nRXw",
  authDomain: "attendance-40e97.firebaseapp.com",
  projectId: "attendance-40e97",
  storageBucket: "attendance-40e97.firebasestorage.app",
  messagingSenderId: "136574176100",
  appId: "1:136574176100:web:b7f473d849f6341acc4871",
  measurementId: "G-BTZPYS8Y3C"
};
```

## Estructura de Datos Firestore

### Colección: employees
```javascript
{
  id: "empleado_001",
  name: "Juan Pérez",
  email: "juan@empresa.com",
  phone: "+1234567890",
  avatar: "url_imagen",
  active: true,
  assignedLocations: ["local_001", "local_002"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Colección: locations  
```javascript
{
  id: "local_001",
  name: "Sucursal Centro",
  address: "Calle Principal 123",
  phone: "+1234567890",
  image: "url_imagen",
  active: true,
  manager: "admin_001",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Colección: attendance
```javascript
{
  id: "asistencia_001",
  employeeId: "empleado_001",
  employeeName: "Juan Pérez",
  locationId: "local_001",
  locationName: "Sucursal Centro",
  checkIn: timestamp,
  checkOut: timestamp,
  totalHours: 8.5,
  date: "2025-12-01",
  status: "completed",
  createdAt: timestamp
}
```

### Colección: current_sessions
```javascript
{
  id: "session_001",
  employeeId: "empleado_001",
  employeeName: "Juan Pérez",
  locationId: "local_001",
  locationName: "Sucursal Centro",
  checkIn: timestamp,
  currentTime: timestamp,
  status: "active",
  deviceInfo: "navegador/dispositivo"
}
```

## Funcionalidades por Página

### Index.html - Fichaje Principal
- Selector de local con preview de imagen
- Grid de empleados con estados visuales
- Botones de entrada/salida con confirmaciones
- Panel de empleados activos en tiempo real
- Estadísticas del día actual

### Admin.html - Administración
- CRUD de locales con formularios validados
- CRUD de empleados con carga de imágenes
- Asignación de empleados a locales
- Gestión de permisos y roles
- Configuración del sistema

### Dashboard.html - Control en Tiempo Real
- Vista general de todos los locales
- Monitor de empleados activos
- Timeline de actividad reciente
- Gráficos de asistencia en vivo
- Sistema de alertas y notificaciones

### Reports.html - Reportes y Análisis
- Filtros avanzados por fecha, local, empleado
- Tablas ordenables con paginación
- Exportación a PDF y Excel
- Gráficos estadísticos
- Comparativas de períodos

## Librerías y Dependencias

### Core
- Firebase SDK (Firestore, Auth, Storage)
- Tailwind CSS para estilos
- Lucide Icons para iconografía

### Animaciones y Efectos
- Anime.js para animaciones suaves
- ECharts.js para gráficos
- Splitting.js para efectos de texto

### Utilidades
- Date-fns para manejo de fechas
- Print.js para funciones de impresión
- Papa Parse para exportación CSV

## Diseño Responsive

### Mobile (< 768px)
- Navegación tipo app (bottom tabs)
- Cards apilados verticalmente
- Touch targets grandes (44px+)
- Swipe gestures para acciones

### Tablet (768px - 1024px)
- Layout de dos columnas
- Sidebar colapsable
- Tablas optimizadas para touch
- Modo landscape preferido

### Desktop (> 1024px)
- Layout de tres columnas
- Hover states y tooltips
- Atajos de teclado
- Multi-window support

## Optimizaciones

### Rendimiento
- Lazy loading de imágenes
- Código dividido por páginas
- Cache de datos frecuentes
- Compresión de assets

### Seguridad
- Validación en cliente y servidor
- Rate limiting en operaciones
- Encriptación de datos sensibles
- Logs de auditoría

### Accesibilidad
- Contraste mínimo 4.5:1
- Navegación por teclado
- Screen reader compatible
- Textos alternativos en imágenes