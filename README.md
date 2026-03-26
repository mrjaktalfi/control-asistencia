# AsistenciaPro - Sistema de Gestión de Asistencia

## Descripción General

AsistenciaPro es un sistema completo de gestión de asistencia de empleados diseñado para empresas con múltiples locales. El sistema permite el fichaje de entrada y salida de empleados, gestión de locales y empleados, monitoreo en tiempo real y generación de reportes detallados.

## Características Principales

### 🏢 Gestión de Locales
- CRUD completo de locales
- Asignación de empleados a locales
- Estado de locales (activo/inactivo)
- Imágenes y detalles de cada local

### 👥 Gestión de Empleados
- Registro de empleados con fotos
- Asignación a múltiples locales
- Estados de empleados (activo/inactivo)
- Cargos y posiciones

### ⏰ Sistema de Fichaje
- Fichaje de entrada/salida con un clic
- Soporte para múltiples dispositivos
- Validación de doble registro
- Cálculo automático de horas trabajadas

### 📊 Dashboard en Tiempo Real
- Vista general de todos los locales
- Empleados activos por local
- Gráficos de actividad en vivo
- Sistema de alertas y notificaciones

### 📈 Reportes y Análisis
- Filtros avanzados por fecha, local, empleado
- Exportación a PDF y Excel
- Gráficos estadísticos
- Análisis de tendencias

### 🔒 Seguridad y Permisos
- Autenticación integrada
- Roles de usuario
- Auditoría de cambios
- Respaldo de datos

## Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **Tailwind CSS** - Framework de estilos
- **JavaScript ES6+** - Lógica de aplicación
- **Anime.js** - Animaciones suaves
- **ECharts.js** - Gráficos interactivos

### Backend
- **Firebase** - Backend como servicio
  - **Firestore** - Base de datos NoSQL
  - **Firebase Auth** - Autenticación
  - **Firebase Storage** - Almacenamiento de archivos

### Librerías Adicionales
- **Splitting.js** - Efectos de texto
- **Typed.js** - Animación de escritura
- **Matter.js** - Física para efectos visuales
- **p5.js** - Gráficos creativos

## Estructura del Proyecto

```
/mnt/okcomputer/output/
├── index.html              # Página principal de fichaje
├── admin.html              # Panel de administración
├── dashboard.html          # Dashboard en tiempo real
├── reports.html            # Sistema de reportes
├── test.html               # Página de pruebas
├── main.js                 # Lógica principal del sistema
├── admin.js                # Lógica del panel de administración
├── dashboard.js            # Lógica del dashboard
├── reports.js              # Lógica de reportes
├── firebase-config.js      # Configuración de Firebase
├── effects.css             # Efectos visuales y animaciones
├── resources/              # Recursos multimedia
│   ├── hero-bg.jpg
│   ├── office-1.jpg
│   ├── office-2.jpg
│   ├── office-3.jpg
│   ├── team-meeting.jpg
│   └── workspace.jpg
├── design.md               # Documento de diseño
├── interaction.md          # Diseño de interacción
├── project_outline.md      # Estructura del proyecto
└── README.md               # Este archivo
```

## Configuración de Firebase

El sistema utiliza Firebase para el almacenamiento de datos en tiempo real. La configuración proporcionada es:

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

## Estructura de la Base de Datos

### Colección: `employees`
```javascript
{
    id: "empleado_001",
    name: "Juan Pérez",
    email: "juan@empresa.com",
    phone: "+1234567890",
    avatar: "url_imagen",
    position: "Gerente",
    active: true,
    assignedLocations: ["local_001", "local_002"],
    createdAt: timestamp,
    updatedAt: timestamp
}
```

### Colección: `locations`
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

### Colección: `attendance`
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

### Colección: `current_sessions`
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

## Instalación y Configuración

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet
- Acceso a la configuración de Firebase

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd asistenciapro
   ```

2. **Verificar la estructura de archivos**
   - Asegurarse de que todos los archivos estén presentes
   - Verificar que las imágenes estén en el directorio `resources/`

3. **Configurar Firebase (opcional)**
   - Si se desea usar Firebase real, crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Actualizar la configuración en `firebase-config.js`
   - Habilitar Firestore y Auth en el proyecto

4. **Abrir en navegador**
   - Abrir `index.html` en un navegador web
   - O usar un servidor local: `python -m http.server 8000`

## Uso del Sistema

### Página Principal (index.html)
1. **Seleccionar un local** de la lista disponible
2. **Ver empleados** del local seleccionado
3. **Fichar entrada/salida** usando los botones correspondientes
4. **Monitorear empleados activos** en el panel derecho

### Panel de Administración (admin.html)
1. **Gestión de Locales**:
   - Crear nuevos locales
   - Editar información existente
   - Activar/desactivar locales
   
2. **Gestión de Empleados**:
   - Agregar nuevos empleados
   - Asignar empleados a locales
   - Gestionar estados de empleados
   
3. **Configuración del Sistema**:
   - Horarios de trabajo
   - Notificaciones
   - Permisos

### Dashboard en Tiempo Real (dashboard.html)
1. **Vista General**:
   - Estadísticas resumidas
   - Empleados activos por local
   - 
   
2. **Monitoreo en Vivo**:
   - Actividad reciente
   - Gráficos de asistencia
   - Alertas del sistema

### Sistema de Reportes (reports.html)
1. **Generar Reportes**:
   - Filtrar por fecha, local, empleado
   - Elegir tipo de reporte
   - Vista previa de resultados
   
2. **Exportar Datos**:
   - Imprimir reportes
   - Exportar a PDF
   - Exportar a Excel/CSV

## Funcionalidades Avanzadas

### Real-time Updates
- Los cambios se sincronizan instantáneamente entre todos los dispositivos
- WebSockets para actualizaciones en vivo
- Notificaciones push para eventos importantes

### Responsive Design
- Adaptación automática a diferentes tamaños de pantalla
- Interfaz optimizada para móviles y tablets
- Touch gestures para acciones rápidas

### Animaciones y Efectos Visuales
- Transiciones suaves entre secciones
- Efectos de hover y focus
- Animaciones de carga y estado
- Fondos dinámicos y gradientes

### Accesibilidad
- Contraste adecuado para lectura
- Navegación por teclado
- Soporte para screen readers
- Modo de alto contraste

## Solución de Problemas

### Problemas Comunes

1. **Firebase no se conecta**
   - Verificar la configuración de la API key
   - Comprobar que el proyecto esté activo
   - Revisar las reglas de seguridad de Firestore

2. **Las imágenes no se cargan**
   - Verificar que las imágenes estén en el directorio `resources/`
   - Comprobar las rutas en el código
   - Asegurar que el servidor tenga permisos de lectura

3. **Las animaciones no funcionan**
   - Verificar que los archivos CSS estén cargados
   - Comprobar la consola del navegador por errores
   - Asegurar que JavaScript esté habilitado

4. **Los reportes no se generan**
   - Verificar que haya datos en el rango de fechas seleccionado
   - Comprobar los filtros aplicados
   - Revisar la consola por errores de JavaScript

### Depuración

1. **Herramientas de desarrollo del navegador**
   - Abrir la consola (F12)
   - Verificar errores en la pestaña Console
   - Inspeccionar elementos en la pestaña Elements

2. **Logs del sistema**
   - Los errores se muestran en la consola
   - Los mensajes de estado aparecen en la interfaz
   - Las notificaciones toast indican el estado de las operaciones

## Seguridad

### Medidas de Seguridad Implementadas

1. **Validación de Datos**
   - Validación en cliente y servidor
   - Sanitización de entradas de usuario
   - Prevención de inyección de código

2. **Autenticación**
   - Sistema de autenticación integrado
   - Roles y permisos de usuario
   - Sesiones seguras

3. **Protección de Datos**
   - Encriptación de datos sensibles
   - Respaldo automático de información
   - Auditoría de cambios

### Mejores Prácticas

- No compartir credenciales de Firebase
- Usar HTTPS en producción
- Limitar acceso a la base de datos
- Monitorear logs de actividad

## Mantenimiento

### Actualizaciones Regulares
- Mantener las librerías actualizadas
- Revisar la configuración de Firebase
- Optimizar el rendimiento
- Actualizar la documentación

### Backups
- Respaldar la configuración de Firebase
- Exportar datos periódicamente
- Mantener copias de seguridad de imágenes
- Documentar cambios importantes

## Soporte y Contacto

Para soporte técnico o consultas sobre el sistema:

- **Documentación**: Consultar los archivos `.md` en el proyecto
- **Pruebas**: Usar `test.html` para verificar funcionalidad
- **Debugging**: Revisar la consola del navegador
- **Actualizaciones**: Seguir las mejores prácticas de desarrollo

## Licencia

Este proyecto está diseñado para uso empresarial. Todos los derechos reservados.

---

**AsistenciaPro v1.0** - Sistema de Gestión de Asistencia Profesional
Desarrollado con ❤️ para la gestión eficiente de recursos humanos