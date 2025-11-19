# Módulo 10: Wiki / Docs (Segundo Cerebro)

**Objetivo:** Centralizar el conocimiento del negocio y los procesos operativos, permitiendo que la documentación sea activa y ejecutable, no solo texto estático.

## Características Principales

### 1. Wiki Estructurada
*   **Árbol de Documentos:** Organización jerárquica infinita (carpetas y sub-documentos).
*   **Contenido Rico:** Soporte para Markdown, bloques de código con resaltado de sintaxis, imágenes y embeds.
*   **Backlinks:** Referencias cruzadas entre documentos.
*   **Versionado:** Historial de cambios y restauraciones.

### 2. SOPs Ejecutables (Standard Operating Procedures)
*   Transformación de documentación estática en checklists interactivos.
*   **Plantillas vs. Instancias:** Definición de procesos estándar y su ejecución en contextos específicos (ej. "Checklist Pre-Lanzamiento" aplicado al "Proyecto X").
*   Seguimiento de progreso en tiempo real.

### 3. Búsqueda Avanzada
*   Búsqueda Full-Text en títulos y contenido.
*   Filtrado por etiquetas, autor y fecha.

## Especificaciones Técnicas

### Reglas de Implementación
*   **Directorio Base:** `src/features/wiki/`
*   **Dependencias Clave:**
    *   `@tiptap/react`: Core del editor.
    *   `@tiptap/starter-kit`: Funcionalidades básicas.
    *   `fuse.js`: Búsqueda difusa en cliente (o PostgreSQL FTS en backend).

### 1. Modelo de Datos (Tree Structure)

Para manejar documentos anidados eficientemente en Supabase/SQL:

```typescript
// Tabla: wiki_documents
interface WikiDocument {
  id: string; // UUID
  workspace_id: string;
  parent_id: string | null; // Null si es raíz
  title: string;
  slug: string; // Generado para URLs amigables
  content: JSON; // TipTap JSON output para persistencia estructurada
  plain_text: string; // Campo generado para indexación de búsqueda
  icon: string | null; // Emoji o URL de icono
  is_published: boolean;
  position: number; // Para ordenamiento manual dentro del mismo padre
  path: string; // Materialized path (ej: "root_id.child_id") para consultas eficientes de árbol
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Tabla: sop_templates
interface SOPTemplate {
  id: string;
  document_id: string; // Vinculado a un documento de la wiki explicativo
  name: string;
  description: string;
  steps: Array<{
    id: string;
    label: string;
    description?: string;
    is_mandatory: boolean;
    role_required?: string; // Quién debe completar este paso
  }>;
}

// Tabla: sop_instances
interface SOPInstance {
  id: string;
  template_id: string;
  related_entity_type: 'project' | 'task' | 'client';
  related_entity_id: string; // ID del proyecto/tarea donde se ejecuta
  status: 'active' | 'completed' | 'archived';
  progress: number; // Porcentaje calculado 0-100
  current_step_index: number;
  completed_steps: Array<{
    step_id: string;
    completed_at: string;
    completed_by: string;
    notes?: string;
  }>;
  started_at: string;
}
```

### 2. Configuración del Editor (TipTap)

El editor debe ser extensible y soportar bloques personalizados.

**Configuración Base:**

```typescript
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

// Componente Editor
const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true, // O idealmente subir a storage y usar URL
    }),
    Link.configure({
      openOnClick: false,
    }),
    Placeholder.configure({
      placeholder: 'Escribe "/" para comandos...',
    }),
    // Custom Extension para SOP Checkbox
    Node.create({
      name: 'sopCheckbox',
      group: 'block',
      content: 'inline*',
      // ... lógica de renderizado de checkbox interactivo
    })
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    const json = editor.getJSON();
    // Debounce save function
    saveDocument(json);
  }
})
```

### 3. Sistema de Búsqueda Full-Text

Estrategia híbrida para rendimiento y exactitud.

**A. Búsqueda Rápida (Cliente - Fuse.js):**
*   Cargar estructura ligera del árbol (ID, Título, Padre) al inicio.
*   Permite navegación rápida "tipo Spotlight" (Cmd+K) para saltar entre documentos.

**B. Búsqueda Profunda (Backend - PostgreSQL):**
*   Utilizar `tsvector` en la columna `plain_text` o `title`.
*   Query SQL ejemplo:
    ```sql
    SELECT id, title, ts_headline(plain_text, q) as snippet
    FROM wiki_documents, to_tsquery('english', 'termino_busqueda') q
    WHERE to_tsvector('english', title || ' ' || plain_text) @@ q;
    ```

### 4. Lógica de SOPs Ejecutables

El ciclo de vida de un SOP es:

1.  **Definición:** El usuario crea un documento en la Wiki y lo marca como "Contiene SOP". Define los pasos usando bloques especiales de lista de verificación.
2.  **Instanciación:**
    *   Desde el Dashboard de Proyecto -> "Iniciar Proceso".
    *   Se selecciona el Template (ej. "Onboarding Cliente").
    *   Se crea un registro en `sop_instances` copiando la estructura de pasos actual. **Importante:** Copiar, no referenciar, para que si cambia el template, la instancia histórica no se rompa.
3.  **Ejecución:**
    *   La UI renderiza la lista de pasos.
    *   Al marcar un check, se actualiza `sop_instances.completed_steps` y se recalcula el `progress`.
    *   Si todos los `is_mandatory` están completos, el SOP pasa a `status: completed`.

## Integración con UI
*   **Sidebar Izquierdo:** Árbol de navegación colapsable/expandible recursivo.
*   **Breadcrumbs:** Navegación de migas de pan basada en la jerarquía `parent_id`.
*   **Floating Menu:** Menú flotante de TipTap para formato rápido al seleccionar texto.