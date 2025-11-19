# Módulo 11: IA Copilot ("Jarvis")

## Descripción General
El **IA Copilot** actúa como un empleado junior disponible 24/7, diseñado para asistir al freelancer en la gestión de información y la generación de contenido. Este módulo integra inteligencia artificial para procesar el contexto de todo el sistema (CRM, Proyectos, Facturación) y ofrecer respuestas precisas o generar entregables útiles.

## Características Principales

### 11.1. Asistente de Contexto
Un chat lateral inteligente con acceso de lectura a todos los datos del sistema.
- **Funcionalidad:** Permite al usuario realizar consultas en lenguaje natural sobre la información almacenada.
- **Capacidades:**
  - Búsqueda transversal en correos, facturas, proyectos y notas.
  - Respuestas contextualizadas basadas en el historial del cliente.
- **Ejemplos de Uso:**
  - *"¿Cuándo fue la última vez que hablé con Coca-Cola y cuánto les cobré?"*
  - *"Resúmeme los puntos clave de la última reunión con el cliente X."*

### 11.2. Generador de Entregables
Herramienta para la creación asistida de contenido y documentos.
- **Funcionalidad:** Genera borradores, estructuras y contenidos creativos utilizando datos del proyecto o archivos adjuntos.
- **Capacidades:**
  - Creación de estructuras de informes.
  - Generación de ideas para contenido de marketing.
  - Redacción de correos o propuestas.
- **Ejemplos de Uso:**
  - *"Genera la estructura de un informe SEO para el cliente X usando los datos adjuntos."*
  - *"Escribe 5 ideas de posts para LinkedIn sobre este proyecto."*

### 11.3. Arquitectura RAG (Retrieval-Augmented Generation)
Para garantizar respuestas precisas sobre los datos del usuario y evitar alucinaciones, se implementa un flujo RAG avanzado:

1.  **Ingesta y Procesamiento**:
    *   Los documentos (PDFs, facturas), notas y registros del CRM se procesan automáticamente.
    *   **Chunking**: El texto se divide en fragmentos semánticos (ej. 512 tokens) con solapamiento.
2.  **Vectorización (Embeddings)**:
    *   Se generan vectores numéricos para cada fragmento utilizando un modelo de embeddings (ej. OpenAI text-embedding-3-small).
3.  **Almacenamiento Vectorial**:
    *   Los vectores se almacenan en una base de datos compatible (ej. Supabase con pgvector).
4.  **Recuperación Semántica**:
    *   Cuando el usuario consulta, su pregunta se convierte en vector.
    *   Se realiza una búsqueda de similitud coseno para encontrar los fragmentos más relevantes en la base de datos.
5.  **Generación Aumentada**:
    *   Se construye un prompt que incluye: Instrucciones del Sistema + Contexto Recuperado + Pregunta del Usuario.
    *   El LLM genera la respuesta basándose estrictamente en el contexto proporcionado.

### 11.4. Prompts Base del Sistema
El comportamiento del Copilot se define mediante prompts estructurados y versionados.

**System Prompt General (Chat de Contexto):**
```text
Eres Jarvis, un asistente ejecutivo de alto nivel especializado en gestión de negocios freelance.
Tu objetivo es ayudar al usuario a gestionar sus clientes, proyectos y finanzas de forma eficiente.
Tienes acceso a fragmentos de documentos y datos del CRM, Facturación y Proyectos recuperados dinámicamente.

Reglas:
1. Responde de forma concisa, profesional y directa.
2. Basa tus respuestas ÚNICAMENTE en el contexto proporcionado (Contexto RAG).
3. Si la información no está en el contexto, di: "No encuentro información sobre eso en tus documentos actuales". No inventes datos.
4. Cita la fuente de información si es posible (ej. "Según la factura F-2024-001...").
5. Mantén un tono proactivo, sugiriendo acciones siguientes cuando sea pertinente.
```

**Prompt para Generación de Entregables (Task Runner):**
```text
Actúa como un experto en [ROL_DINAMICO, ej. Marketing Digital, Consultoría Legal].
Tu tarea es generar [TIPO_ENTREGABLE] para el cliente [NOMBRE_CLIENTE].
Utiliza el siguiente contexto del proyecto y los archivos adjuntos para personalizar el contenido.
Sigue estas guías de estilo: [GUIAS_ESTILO_USUARIO].
Formato de salida: [Markdown/HTML/Texto Plano].
```

### 11.5. Manejo de Cuotas y Tokens
Para asegurar la sostenibilidad del servicio y controlar costes:

*   **Control de Uso**:
    *   **Token Budget Mensual**: Límite de tokens de entrada/salida asignado según el plan de suscripción (ej. Free: 100k, Pro: 2M).
    *   **Soft Limits**: Alertas al usuario al alcanzar el 50%, 80% y 100% de su cuota.
*   **Optimización**:
    *   Resumen automático de historiales de chat largos para ahorrar contexto.
    *   Uso de modelos más ligeros para tareas simples y modelos potentes (ej. GPT-4) solo para razonamiento complejo.
*   **Rate Limiting**:
    *   Límite de peticiones por minuto (RPM) para evitar abusos de la API.

### 11.6. Endpoints y Streaming
La API está diseñada para soportar respuestas en tiempo real (streaming) para mejorar la percepción de velocidad.

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/v1/copilot/chat/stream` | Envía un mensaje al chat. Retorna un stream SSE (Server-Sent Events) con la respuesta token a token. |
| `POST` | `/api/v1/copilot/generate` | Solicita la generación de un entregable complejo (proceso asíncrono/long-polling o stream si es corto). |
| `GET` | `/api/v1/copilot/history/{threadId}` | Recupera el historial de mensajes de una conversación específica. |
| `POST` | `/api/v1/copilot/context/ingest` | Trigger manual para re-indexar un documento o entidad en la base vectorial. |
| `GET` | `/api/v1/copilot/usage` | Devuelve el consumo actual de tokens y el límite restante del usuario. |

---

## Especificaciones Técnicas de Implementación

La implementación de este módulo debe seguir estrictamente la siguiente estructura de directorios y organización de código.

### Estructura de Directorios
Todo el código relacionado con este módulo debe residir en `src/features/ia-copilot/`.

```
src/features/ia-copilot/
├── api/            # Servicios de comunicación con el backend/API de IA
│   ├── chatService.ts          # Cliente para /chat/stream y gestión de hilos
│   ├── generatorService.ts     # Cliente para /generate
│   └── usageService.ts         # Cliente para consultar cuotas
├── components/     # Componentes de UI reutilizables y específicos del módulo
│   ├── ChatInterface.tsx       # Interfaz principal del chat (Input + Lista de mensajes)
│   ├── ContextProvider.tsx     # React Context para estado global del chat (hilos, loading, errores)
│   ├── DeliverableForm.tsx     # Formulario de configuración para generar entregables
│   ├── MessageBubble.tsx       # Visualización de mensajes (Markdown rendering, citas)
│   └── UsageIndicator.tsx      # Widget visual del consumo de tokens
├── hooks/          # Custom hooks para lógica de negocio
│   ├── useChatStream.ts        # Lógica para manejar SSE y estado de escritura
│   └── useRAGContext.ts        # Gestión de documentos seleccionados para contexto
└── pages/          # Páginas principales del módulo
    └── CopilotDashboard.tsx    # Vista centralizada del asistente
```

### Integración y Dependencias
- **API de IA**: Conexión con backend (Python/Node) que orquesta LLMs (OpenAI/Anthropic) y Base Vectorial.
- **Frontend**:
    - Uso de `fetch` o `axios` con soporte para `ReadableStream` para manejar SSE.
    - Renderizado de Markdown seguro en el chat.
- **Seguridad**:
    - Validación estricta de permisos de lectura (Row Level Security) antes de incluir datos en el contexto RAG.
    - Sanitización de inputs de usuario para evitar Prompt Injection.