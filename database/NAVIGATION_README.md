# Sistema de Gestión de Navegación de la App Móvil

## Descripción

Este sistema permite configurar dinámicamente las pestañas de navegación que se mostrarán en la aplicación móvil desde un panel de administración web.

## Archivos Creados

### Backend/API
- **`src/features/settings/api/navigationService.ts`**: Servicio API para gestionar las pestañas de navegación en Supabase

### Frontend/Admin
- **`src/pages/settings/NavigationManager.tsx`**: Página de administración para gestionar las pestañas

### Base de Datos
- **`database/navigation_tabs.sql`**: Script SQL para crear la tabla y políticas de seguridad

## Instalación

### 1. Crear la Tabla en Supabase

1. Abre Supabase Dashboard
2. Ve a la sección "SQL Editor"
3. Copia y pega el contenido de `database/navigation_tabs.sql`
4. Ejecuta el script

### 2. Inicializar Datos

Hay dos formas de inicializar las pestañas por defecto:

#### Opción A: Desde la Interfaz de Administración (Recomendado)
1. Accede a la página de administración: `/admin/settings/navigation`
2. Haz clic en el botón "Inicializar Pestañas"
3. Las pestañas por defecto se crearán automáticamente

#### Opción B: Desde SQL Editor
1. Descomenta las líneas de INSERT en `database/navigation_tabs.sql`
2. Ejecuta solo esa parte del script

## Uso

### Acceder a la Página de Administración

Navega a: **`/admin/settings/navigation`**

### Funcionalidades Disponibles

1. **Ver todas las pestañas**: Lista completa de pestañas configuradas
2. **Activar/Desactivar**: Toggle para mostrar u ocultar pestañas en la app
3. **Reordenar**: Arrastra y suelta para cambiar el orden de aparición
4. **Crear nueva pestaña**: Agrega pestañas personalizadas
5. **Eliminar pestaña**: Elimina pestañas no esenciales (las del sistema están protegidas)

### Pestañas del Sistema

Las pestañas marcadas como "sistema" (con icono de escudo 🛡️) no pueden eliminarse. Actualmente:
- **INICIO**: Página principal de la app

### Crear una Nueva Pestaña

1. Haz clic en "Nueva Pestaña"
2. Completa los campos:
   - **Clave (KEY)**: Identificador único en mayúsculas (ej: `MI_SECCION`)
   - **Nombre en Español**: Texto que se mostrará en la app en español
   - **Nombre en Inglés**: Texto que se mostrará en la app en inglés
   - **Icono**: Selecciona un icono de Ionicons
   - **Activo**: Si debe mostrarse inmediatamente
3. Haz clic en "Crear Pestaña"

## Integración con la App Móvil

### Modificar CustomHeader.js

Para que la app móvil lea la configuración desde Supabase:

1. Abre `CustomHeader.js`
2. Importa el servicio:
```javascript
import { getActiveNavigationTabs } from '../features/settings/api/navigationService';
```

3. Reemplaza el array `tabs` hardcoded por una carga dinámica:

```javascript
const [tabs, setTabs] = useState([]);

useEffect(() => {
  const loadTabs = async () => {
    try {
      const activeTabs = await getActiveNavigationTabs();
      setTabs(activeTabs.map(tab => ({
        key: tab.key,
        icon: tab.icon
      })));
    } catch (error) {
      console.error('Error loading tabs:', error);
      // Fallback a tabs por defecto si hay error
      setTabs(defaultTabs);
    }
  };

  loadTabs();
}, []);
```

4. Actualiza el componente para usar las traducciones de la base de datos:

```javascript
const getTabLabel = (tab, language) => {
  return language === 'es' ? tab.label_es : tab.label_en;
};
```

## Estructura de la Tabla

```sql
navigation_tabs (
  id UUID PRIMARY KEY,
  key VARCHAR(100) UNIQUE,      -- Identificador único
  label_es VARCHAR(255),         -- Nombre en español
  label_en VARCHAR(255),         -- Nombre en inglés
  icon VARCHAR(100),             -- Icono de Ionicons
  order INTEGER,                 -- Orden de aparición
  is_active BOOLEAN,             -- Si está visible
  is_system BOOLEAN,             -- Si es pestaña del sistema
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Seguridad

- **Row Level Security (RLS)** habilitado
- Los usuarios anónimos solo ven pestañas activas
- Solo usuarios autenticados pueden crear/modificar pestañas
- Las pestañas del sistema no pueden eliminarse

## Iconos Disponibles

Los siguientes iconos de Ionicons están disponibles por defecto:
- home, calendar, wine, people, storefront, map, trophy
- bicycle, chatbubbles, mail, settings, cart, search
- star, heart, gift, book, camera, document, folder

Puedes agregar más iconos en `NavigationManager.tsx` en el array `AVAILABLE_ICONS`.

## Troubleshooting

### Error: "No se pueden cargar las pestañas"
- Verifica que la tabla `navigation_tabs` existe en Supabase
- Revisa los permisos RLS en Supabase Dashboard
- Comprueba que las políticas de seguridad estén creadas

### Las pestañas no aparecen en la app móvil
- Asegúrate de que las pestañas estén marcadas como activas (`is_active = true`)
- Verifica que CustomHeader.js esté leyendo de la base de datos
- Revisa los logs de la consola para errores de red

### No puedo eliminar una pestaña
- Si tiene el icono de escudo, es una pestaña del sistema y no puede eliminarse
- Solo puedes desactivarla usando el toggle "Visible/Oculto"

## Mejoras Futuras

- [ ] Permisos por rol (admin, editor, viewer)
- [ ] Historial de cambios
- [ ] Preview en tiempo real
- [ ] Importar/Exportar configuraciones
- [ ] Pestañas condicionales por país/región
- [ ] A/B testing de configuraciones
