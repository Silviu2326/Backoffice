# 12. Configuración Global del Sistema

Este módulo centraliza el control maestro sobre el comportamiento operativo de la aplicación móvil y el backoffice. Permite a los Super Administradores gestionar versiones críticas, cumplimiento legal y parámetros de configuración sin necesidad de redesplegar código.

---

## 12.1. Versiones de App y Mantenimiento

Esta sección es crítica para asegurar la compatibilidad entre el cliente móvil y el backend, así como para gestionar paradas técnicas.

### Funcionalidades Clave

1.  **Control de Versión Mínima (Force Update):**
    *   **Campo:** `min_client_version` (e.g., "1.0.5").
    *   **Comportamiento:** Al iniciar la app, el cliente compara su versión local con este valor. Si es inferior, bloquea la navegación y muestra una pantalla obligando al usuario a actualizar desde la Store.
    *   **Caso de Uso:** Despliegue de cambios rotundos en la API que rompen versiones antiguas.

2.  **Modo Mantenimiento:**
    *   **Switch:** `maintenance_mode_enabled` (ON/OFF).
    *   **Mensaje Personalizable:** Campo de texto para explicar la razón (e.g., "Estamos mejorando nuestros servidores. Volvemos en 1 hora.").
    *   **Comportamiento:** La app entra en modo "Solo Lectura" o bloqueo total, mostrando la pantalla de mantenimiento. Los administradores pueden seguir accediendo al Backoffice.

---

## 12.2. Gestión de Textos Legales (Legal CMS)

Sistema para asegurar el cumplimiento normativo (GDPR/RGPD, LOPD) y gestionar los términos de servicio.

### Funcionalidades Clave

1.  **Editor de Documentos:**
    *   Editor de texto enriquecido (WYSIWYG) para redactar:
        *   **Política de Privacidad.**
        *   **Términos y Condiciones de Uso.**
        *   **Política de Cookies.**
        *   **Bases Legales de Sorteos/Eventos.**

2.  **Versionado y Re-aceptación (Consent Management):**
    *   **Control de Versiones:** Cada documento tiene un número de versión (e.g., v2.1).
    *   **Trigger de Aceptación:** Si se publica una nueva versión de los "Términos y Condiciones", el sistema invalidará la aceptación previa de los usuarios.
    *   **Flujo de Usuario:** En el siguiente inicio de sesión, el usuario verá un modal bloqueante ("Hemos actualizado nuestras políticas") que debe aceptar explícitamente para continuar usando la app.
    *   **Auditoría:** Se registra en la base de datos la versión exacta aceptada por cada usuario y la fecha/hora (`user_agreements`).

---

## 12.3. Variables de Entorno y Configuración General

Panel para ajustar parámetros dinámicos que no requieren un nuevo despliegue de la aplicación.

### Parámetros Configurables

1.  **Información de Contacto:**
    *   Email de Soporte (visible en la app).
    *   Teléfono de atención al cliente.
    *   Horario de atención (texto visible).

2.  **Redes Sociales:**
    *   Enlaces dinámicos a perfiles (Instagram, TikTok, Twitter). Permite cambiar la URL si la cuenta cambia o para campañas específicas.

3.  **Configuración Técnica Pública:**
    *   Keys públicas de servicios de terceros (si aplica y es seguro exponerlas, e.g., Mapbox public key, aunque se prefiere mantener en env vars del servidor, a veces se requiere inyección dinámica).
    *   URLs de endpoints específicos si se requiere redirección de tráfico.

---

## 12.4. Interfaz de Usuario (UI)

Siguiendo el **Sistema de Diseño**, este módulo debe reflejar sobriedad y control.

*   **Estilo:** Formularios claros sobre tarjetas gris oscuro (`#2C2C2C`).
*   **Acciones Críticas:** Botones que afectan a todos los usuarios (como activar Modo Mantenimiento) deben tener confirmación de doble paso y usar el color de error (`#DC2626`) o advertencia.
*   **Feedback:** Indicadores claros del estado actual del sistema (e.g., Un banner persistente en el header del Backoffice si el "Modo Mantenimiento" está activo).

---

## 12.5. Modelo de Datos (Referencia)

Entidad principal `app_settings` (Singleton - solo una fila activa o tabla clave-valor):

```sql
CREATE TABLE app_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_client_version text NOT NULL DEFAULT '1.0.0',
  maintenance_mode boolean DEFAULT false,
  maintenance_message text,
  privacy_policy_content text,
  privacy_policy_version text DEFAULT '1.0',
  terms_conditions_content text,
  terms_conditions_version text DEFAULT '1.0',
  support_email text,
  social_links jsonb, -- { "instagram": "...", "tiktok": "..." }
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
```
