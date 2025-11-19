# Módulo 8: Legal & Contratos

## Objetivo
Protección blindada en minutos.

## Características Principales

### 8.1. Generador de Contratos Variables
Sistema inteligente para la redacción automática de contratos legales basados en parámetros configurables.

*   **Formulario Dinámico:**
    *   Preguntas clave para configurar el contrato (e.g., "¿Incluye cesión de derechos de autor?", "¿Hay penalización por retraso?").
    *   Lógica condicional basada en las respuestas (Sí/No).
*   **Generación de Documentos:**
    *   Redacción automática del contrato en formato PDF.
    *   Plantillas adaptables según el tipo de servicio y cliente.

### 8.2. Trazabilidad de Firma y Custodia Digital
Sistema de firma digital segura con auditoría completa.

*   **Log de Auditoría Detallado:**
    *   Registro de eventos clave: Apertura del contrato, lectura, y firma.
    *   Captura de metadatos: Dirección IP, fecha y hora exacta (Timestamp), dispositivo utilizado (User Agent).
    *   Ejemplo: "Cliente abrió el contrato en IP [IP_ADDRESS] a las [HORA] horas".
*   **Custodia Digital:**
    *   Almacenamiento seguro y organizado de los documentos firmados.
    *   Acceso rápido al historial de contratos por cliente o proyecto.

### 8.3. Estructura de Plantillas (Placeholders)
El sistema utiliza un motor de sustitución de variables para generar documentos personalizados a partir de plantillas base.

*   **Sintaxis de Placeholders:** Se utiliza el formato `{{VARIABLE}}` para la inyección de datos.
*   **Variables Estándar:**
    *   `{{CLIENT_NAME}}`: Nombre completo o razón social del cliente.
    *   `{{CLIENT_ID}}`: Identificación fiscal del cliente (DNI/CIF/NIF).
    *   `{{PROVIDER_NAME}}`: Nombre del freelancer o agencia.
    *   `{{PROJECT_SCOPE}}`: Descripción detallada del alcance del proyecto.
    *   `{{TOTAL_AMOUNT}}`: Monto total del contrato.
    *   `{{START_DATE}}`: Fecha de inicio.
    *   `{{DELIVERY_DATE}}`: Fecha de entrega estimada.
*   **Bloques Condicionales:**
    *   Secciones de texto que solo aparecen si una condición es verdadera (e.g., cláusulas de confidencialidad opcionales).

## Especificaciones Técnicas

### Ubicación de la Implementación
La implementación de este módulo residirá en:
`src/features/legal/`

### Estructura de Directorios
*   `src/features/legal/pages`: Vistas principales (e.g., Lista de Contratos, Editor de Contratos).
*   `src/features/legal/components`: Componentes de UI reutilizables (e.g., Formulario de Contrato, Visor de PDF, Pad de Firma).
*   `src/features/legal/api`: Servicios para comunicación con backend (generación de PDF, almacenamiento de firmas).
*   `src/features/legal/templates`: Definiciones JSON/Markdown de las plantillas base.

### Flujo Técnico de Firma Digital
El proceso de firma asegura la integridad y el no repudio del documento mediante los siguientes pasos:

1.  **Captura de Intención:** El usuario visualiza el documento final y hace clic en "Firmar".
2.  **Recolección de Evidencia:**
    *   **IP Address:** Se captura la IP pública del firmante.
    *   **Timestamp:** Se registra la fecha y hora UTC del servidor (fuente confiable de tiempo).
    *   **User Agent:** Se almacena la información del navegador y sistema operativo.
3.  **Generación de Hash:**
    *   Se calcula un hash SHA-256 del contenido del documento *más* los metadatos de la firma.
    *   `Hash = SHA256(DocumentContent + Timestamp + IP + SignerID)`
    *   Este hash garantiza que el documento no ha sido modificado post-firma.
4.  **Sellado:** El hash y los metadatos se anexan al registro del contrato en la base de datos.

### Almacenamiento Seguro
Estrategia para la persistencia y seguridad de los documentos.

*   **Repositorio de Documentos:**
    *   Los archivos PDF generados y firmados se almacenan en un servicio de almacenamiento de objetos (e.g., AWS S3, Supabase Storage) con encriptación en reposo (AES-256).
    *   Los nombres de archivo son UUIDs aleatorios para evitar enumeración (e.g., `contracts/signed/{uuid}.pdf`).
*   **Control de Acceso:**
    *   URLs firmadas (Signed URLs) con tiempo de expiración corto para la visualización.
    *   Solo los usuarios autorizados (Dueño del contrato, Cliente asociado) pueden solicitar la URL de descarga.
*   **Base de Datos:**
    *   Solo se almacenan las *referencias* (rutas/keys) a los archivos, no los binarios.

### Modelo de Datos (Preliminar)
*   **Contract:**
    *   id: UUID
    *   clientId: UUID
    *   projectId: UUID
    *   status: [DRAFT, SENT, VIEWED, SIGNED, EXPIRED]
    *   content: JSON/HTML (o referencia a template)
    *   variables: JSON (Respuestas del formulario y valores de placeholders)
    *   signedDocumentUrl: String (Ruta en storage)
    *   signatureHash: String (SHA-256)
    *   createdAt: DateTime
*   **AuditLog:**
    *   contractId: UUID
    *   action: [OPEN, SIGN]
    *   ipAddress: String
    *   userAgent: String
    *   timestamp: DateTime