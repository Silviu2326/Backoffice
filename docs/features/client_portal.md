# Módulo 6: Portal del Cliente (Client Portal)

## 1. Descripción General
**Objetivo:** Eliminar los emails de "¿Cómo va lo mío?" y centralizar la comunicación y entregas con el cliente en un entorno profesional y seguro.

Este módulo proporciona una interfaz dedicada para los clientes, permitiéndoles visualizar el progreso de sus proyectos, realizar aprobaciones, y gestionar aspectos administrativos sin necesidad de intervención directa del freelancer.

## 2. Arquitectura e Implementación
Estrictamente, la implementación de este módulo debe residir en la siguiente estructura de directorios:

```
src/features/client-portal/
├── pages/          # Vistas principales (Dashboard, Feedback, Settings)
├── components/     # Componentes UI específicos del portal
│   ├── welcome/    # Widgets de bienvenida
│   ├── feedback/   # Herramientas de revisión y aprobación
│   └── admin/      # Componentes de autoservicio
└── api/            # Servicios de comunicación con el backend
```

## 3. Autenticación y Permisos

### 3.1. Flujo de Autenticación (Magic Links)
Para maximizar la seguridad y la facilidad de uso, el portal utiliza un sistema "Passwordless" basado en enlaces temporales.

1.  **Solicitud:** El cliente introduce su email en la página de acceso al portal (`/portal/login`).
2.  **Validación:** El sistema verifica si el email está asociado a un cliente activo.
3.  **Envío:** Se envía un correo con un **Magic Link** firmado y con expiración (ej. 15 minutos).
4.  **Acceso:** Al hacer clic, el cliente es redirigido a `/portal/auth/verify?token=xyz`, se crea una sesión segura (JWT httpOnly) y accede al Dashboard.

### 3.2. Matriz de Permisos
El sistema distingue entre dos roles principales para los contactos del cliente:

| Recurso / Acción | Rol: Cliente Administrador (Principal) | Rol: Cliente Visualizador (Staff) |
| :--- | :---: | :---: |
| **Ver Progreso** | ✅ | ✅ |
| **Ver Archivos** | ✅ | ✅ |
| **Comentar** | ✅ | ✅ |
| **Aprobar Fases** | ✅ | ❌ |
| **Ver/Pagar Facturas** | ✅ | ❌ |
| **Editar Datos Fiscales**| ✅ | ❌ |
| **Invitar Miembros** | ✅ | ❌ |

## 4. Funcionalidades Detalladas

### 4.1. Dashboard de Bienvenida
La primera pantalla que ve el cliente al acceder. Debe ser acogedora y proporcionar una visión rápida del estado del proyecto.

*   **Mensaje Personalizado:** Capacidad de incrustar un video de bienvenida (ej. Loom) o un mensaje de texto enriquecido.
*   **Barra de Progreso:** Visualización gráfica del avance general del proyecto (porcentaje completado basado en hitos/tareas).
*   **Widget "Próximos Pasos":** Lista clara de acciones requeridas por parte del cliente para desbloquear el flujo de trabajo (ej: "Subir logo", "Aprobar texto", "Validar boceto").

### 4.2. Centro de Aprobaciones (Feedback Loop)
Herramienta crítica para agilizar las revisiones y evitar cadenas de correos interminables.

*   **Visor Interactivo:** Soporte para visualizar imágenes y documentos PDF directamente en el navegador.
*   **Comentarios Contextuales:** El cliente debe poder pinchar en un punto específico del diseño/documento y dejar un comentario anclado a esa posición.
*   **Aprobación de Fase:**
    *   Botón prominente **"APROBAR FASE"**.
    *   **Lógica de Negocio:** Al hacer clic, se bloquean cambios posteriores en esa fase y se puede configurar para disparar automáticamente la emisión de la siguiente factura o hito de pago.

### 4.3. Autoservicio Administrativo
Permite al cliente gestionar sus documentos y datos sin contactar soporte.

*   **Historial de Facturación:** Acceso y descarga de todas las facturas pasadas y pendientes.
*   **Gestión de Perfil:** Formularios para actualizar datos fiscales (Razón Social, VAT/NIF, Dirección) y métodos de pago (Tarjeta de crédito, etc.).

## 5. Flujos de Trabajo

### 5.1. Diagrama de Aprobación de Entregable
Este flujo describe el ciclo de vida de un entregable desde que el freelancer lo sube hasta su aceptación final.

```mermaid
graph TD
    A[Freelancer Sube Entregable] --> B{Notificar Cliente}
    B --> C[Cliente Accede al Portal]
    C --> D[Revisión de Entregable]
    D --> E{¿Está todo correcto?}
    
    E -- No (Hay cambios) --> F[Cliente deja Comentarios Contextuales]
    F --> G[Estado: Cambios Solicitados]
    G --> H[Notificar Freelancer]
    H --> I[Freelancer Sube Nueva Versión]
    I --> B
    
    E -- Sí (Aprobado) --> J[Cliente pulsa 'Aprobar Fase']
    J --> K[Estado: Aprobado]
    K --> L{Acciones Automáticas}
    L --> M[Bloquear Edición Fase]
    L --> N[Generar Factura Hito (si aplica)]
    L --> O[Notificar Freelancer]
```

## 6. API Pública (Portal)

Endpoints expuestos para la interacción del frontend del portal del cliente. Todas las rutas bajo `/api/v1/portal/*` requieren autenticación vía Token (excepto el inicio de sesión).

### Autenticación
*   `POST /api/v1/auth/portal/login`: Solicita el envío de un Magic Link. Body: `{ email }`.
*   `POST /api/v1/auth/portal/verify`: Verifica el token del link y devuelve la sesión. Body: `{ token }`.

### Proyectos y Dashboard
*   `GET /api/v1/portal/projects`: Lista los proyectos activos asociados al cliente autenticado.
*   `GET /api/v1/portal/projects/:id/dashboard`: Datos agregados para el dashboard (progreso, próximos pasos).

### Entregables y Feedback
*   `GET /api/v1/portal/deliverables/:id`: Obtiene detalles de un entregable específico.
*   `POST /api/v1/portal/deliverables/:id/comments`: Crea un comentario (texto + coordenadas x,y).
*   `POST /api/v1/portal/deliverables/:id/approve`: Marca el entregable/fase como aprobado. Requiere rol Admin.

### Finanzas
*   `GET /api/v1/portal/invoices`: Lista de facturas.
*   `GET /api/v1/portal/invoices/:id/pdf`: Descarga de factura en PDF.

## 7. Consideraciones Técnicas
*   **Seguridad:** El acceso debe estar protegido por autenticación robusta. Los clientes solo deben tener acceso a los datos de *sus* proyectos.
*   **Responsive:** El portal debe ser totalmente funcional en dispositivos móviles para aprobaciones rápidas.
*   **Notificaciones:** El sistema debe notificar al freelancer cuando el cliente realiza una acción crítica (ej. Aprobar fase, Nuevo comentario).