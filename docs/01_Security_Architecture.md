# Especificación Técnica: Arquitectura, Seguridad y Control de Acceso

Este documento detalla la arquitectura técnica, los protocolos de seguridad, el control de acceso basado en roles (RBAC) y los mecanismos de auditoría para el Backoffice de Mr. CoolCat.

---

## 1. Stack Tecnológico

La arquitectura del sistema se basa en una separación moderna entre frontend y backend (Headless), priorizando la escalabilidad y la seguridad.

### 1.1 Frontend (Cliente Administrativo)
*   **Framework Principal:** React.js.
*   **Interfaz de Usuario (UI):**
    *   Librería base: Refine, React Admin o Tailwind UI.
    *   Estilizado: Tailwind CSS siguiendo el [Design System](../DESIGN_SYSTEM.md) 
*   **Gestión de Estado:** React Query / TanStack Query (para sincronización con servidor).

### 1.2 Backend & Base de Datos
*   **Plataforma de Backend as a Service (BaaS):** Supabase.
*   **Base de Datos:** PostgreSQL (gestionado por Supabase).
*   **Autenticación:** Supabase Auth (JWT).

### 1.3 Infraestructura
*   **Hosting Frontend:** Vercel .
*   **Hosting Backend/BD:** Supabase Cloud.

---

## 2. Control de Acceso Basado en Roles (RBAC)

El sistema implementa un modelo de permisos estricto donde cada usuario administrativo tiene asignado un único rol principal que dicta sus capacidades de lectura y escritura.

### 2.1 Roles Definidos

| Rol | Nivel de Acceso | Responsabilidades Principales | Permisos Específicos |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `ROOT` | Gestión total del sistema. | • Acceso irrestricto a todos los módulos.<br>• Gestión de `admin_users` (crear/borrar admins).<br>• Acceso a facturación y configuración global (`app_settings`).<br>• Visualización de `audit_logs`. |
| **Store Manager** | `OPERATIVO` | Logística y Ventas. | • **Gestión de Pedidos:** Ver, editar estados, gestionar incidencias y devoluciones.<br>• **Inventario:** CRUD en `products` e `inventory_logs` (ajustes de stock).<br>• **Sedes:** Configurar horarios en `store_hours`. |
| **Marketing Lead** | `CREATIVO` | Crecimiento y Marca. | • **Personajes:** CRUD en `characters` y activos visuales.<br>• **Eventos:** Gestión de `events` y `tickets`.<br>• **Comunicaciones:** Envío de Notificaciones Push y gestión de `coupons`.<br>• **CMS:** Banners y contenido. |
| **Soporte al Cliente** | `SOPORTE` | Atención al usuario. | • **CRM:** Lectura de `users` (perfil 360º).<br>• **Acciones:** Reset password, banear usuario, ajuste manual de puntos (con justificación).<br>• **Pedidos:** Lectura de estado de pedidos.<br>• **Privacidad:** *Masking* de datos sensibles (tarjetas, etc.). |
| **Content Creator** | `LIMITADO` | Multimedia. | • Acceso limitado a biblioteca de medios.<br>• Redacción de entradas de blog o descripciones (requiere aprobación de Marketing Lead o Admin para publicar). |

### 2.2 Matriz de Permisos (CRUD)

| Entidad / Módulo | Super Admin | Store Manager | Marketing Lead | Soporte | Content Creator |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Configuración Global | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| Usuarios Admin | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| Pedidos (Orders) | ✅ Full | ✅ Full | 👁️ Ver | 👁️ Ver | ❌ |
| Inventario | ✅ Full | ✅ Full | 👁️ Ver | ❌ | ❌ |
| Productos | ✅ Full | ✅ Full | 👁️ Ver | 👁️ Ver | 👁️ Ver |
| Marketing/Push | ✅ Full | ❌ | ✅ Full | ❌ | ❌ |
| Personajes/CMS | ✅ Full | ❌ | ✅ Full | ❌ | ✏️ Edición |
| Usuarios (CRM) | ✅ Full | 👁️ Ver | 👁️ Ver | ✏️ Edición* | ❌ |
| Auditoría | ✅ Full | ❌ | ❌ | ❌ | ❌ |

*\*Edición limitada a acciones de soporte específicas.*

---

## 3. Auditoría y Seguridad (Audit Logs)

Para garantizar la trazabilidad y seguridad de las operaciones sensibles, el sistema registrará automáticamente las acciones de escritura.

### 3.1 Estructura del Registro de Auditoría
Cada entrada en la tabla `audit_logs` debe contener:

1.  **Actor (`admin_id`):** Identificador único del administrador que realizó la acción.
2.  **Recurso (`entity`):** Nombre de la tabla o recurso afectado (ej. `products`, `app_settings`).
3.  **Identificador del Recurso (`entity_id`):** ID del registro modificado.
4.  **Acción (`action`):** Tipo de operación: `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `BAN_USER`, `POINT_ADJUSTMENT`.
5.  **Cambios (`changes`):** JSON detallando la modificación.
    *   *Formato:* `{ "field_name": { "old": "value", "new": "value" } }`
6.  **Timestamp (`created_at`):** Fecha y hora exacta del evento (UTC).
7.  **Metadatos (`meta`):** Dirección IP y User Agent del administrador (opcional pero recomendado).

### 3.2 Eventos Críticos a Auditar
*   Inicio de sesión de administradores.
*   Creación, modificación o eliminación de otros administradores.
*   Cambios en precios de productos.
*   Ajustes manuales de stock (mermas/roturas).
*   Ajustes manuales de saldo de puntos de lealtad.
*   Baneo de usuarios.
*   Cambios en la configuración global (Textos legales, versiones mínimas).

---

## 4. Modelo de Datos de Seguridad

Entidades de base de datos requeridas para soportar este módulo (referencia a Supabase Auth y tablas públicas).

### Tabla `admin_users`
Extiende la funcionalidad de autenticación básica.
*   `id`: UUID (FK -> auth.users)
*   `email`: String
*   `full_name`: String
*   `role`: ENUM ('SUPER_ADMIN', 'STORE_MANAGER', 'MARKETING_LEAD', 'SUPPORT', 'CONTENT_CREATOR')
*   `last_login`: Timestamp
*   `status`: ENUM ('ACTIVE', 'SUSPENDED')

### Tabla `audit_logs`
Repositorio inmutable de eventos.
*   `id`: UUID
*   `admin_id`: UUID (FK -> admin_users.id)
*   `action`: String
*   `table_name`: String
*   `record_id`: String/UUID
*   `old_values`: JSONB (nullable)
*   `new_values`: JSONB (nullable)
*   `ip_address`: String
*   `created_at`: Timestamp
