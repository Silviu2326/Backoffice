# Módulo CRM y Soporte Técnico - Mr. CoolCat App

Este documento detalla la funcionalidad, diseño y operativa del módulo de CRM (Customer Relationship Management) y las herramientas de soporte técnico dentro del Backoffice de Mr. CoolCat. Este módulo es el corazón de la gestión de usuarios, permitiendo una visión holística (360º) de cada cliente para ofrecer un servicio personalizado y eficaz.

## 1. Ficha 360º del Cliente

La "Ficha 360º" es la vista principal al acceder al detalle de un usuario. Consolida toda la información relevante en un solo dashboard para que el agente de soporte o marketing pueda tomar decisiones rápidas.

### A. Datos Personales (Identidad)
*   **Información Básica:**
    *   Avatar del usuario (con borde de color según nivel de lealtad).
    *   Nombre completo y "Apodo" (Nickname).
    *   ID de Usuario (UUID interno).
    *   Email y Teléfono (con indicación de "Verificado" / "No verificado").
    *   Fecha de Nacimiento (Cálculo automático de edad para validación legal de venta de alcohol).
    *   **Direcciones:** Listado de direcciones guardadas, marcando la "Predeterminada".

### B. Resumen Financiero (LTV)
Indicadores clave de rendimiento del cliente (KPIs):
*   **Lifetime Value (LTV):** Suma total del dinero gastado por el usuario desde su registro.
*   **Total Pedidos:** Número de pedidos completados (excluyendo cancelados/devueltos).
*   **Ticket Medio:** LTV / Total Pedidos.
*   **Estado de Pagos:** Indicador visual si tiene algún pago pendiente o disputado.

### C. Segmentación y Etiquetas
Sistema de clasificación para marketing y soporte:
*   **Etiquetas Automáticas:** Asignadas por el sistema (ej. "VIP", "Inactivo > 90 días", "Whale" para alto gasto, "Amante de IPAs" basado en historial).
*   **Etiquetas Manuales:** Añadidas por los agentes (ej. "Cliente Conflictivo", "Amigo del Dueño", "Prefiere contacto por WhatsApp").
*   **Diseño UI:** Las etiquetas se muestran como "chips" redondeados con colores semánticos (ej. Rojo para alertas, Verde para VIP).

---

## 2. Historial de Actividad

Un timeline cronológico detallado que permite rastrear cada interacción del usuario con la plataforma.

*   **Sesiones:** Registro de Logins (Fecha, IP, Dispositivo).
*   **Interacciones Físicas:** Eventos a los que ha asistido (Check-in confirmado) y sedes visitadas.
*   **Juegos:** Resumen de partidas jugadas ("Beer Run", "Quiz"), puntuaciones altas y logros desbloqueados en ese momento.
*   **Pedidos:**
    *   Enlace directo al detalle de cada pedido.
    *   Estado visual del pedido (Pagado, Enviado, Entregado).

---

## 3. Gamificación y Lealtad

Esta sección permite gestionar el saldo de puntos y entender el nivel de compromiso del usuario con la marca.

### A. Estado Actual
*   **Saldo de Puntos:** Cantidad actual disponible para canje.
*   **Nivel de Lealtad:** Nivel actual (ej. Novato, Explorador, Maestro Cervecero) basado en puntos históricos o logros.
*   **Barra de Progreso:** Visualización de cuánto falta para el siguiente nivel.

### B. Historial de Puntos
Tabla detallada de transacciones de lealtad (debe/haber):
*   **Entradas (Créditos):** Puntos ganados por compras, registros, reseñas o juegos.
*   **Salidas (Débitos):** Puntos gastados en cupones, merchandising o descuentos.
*   **Ajustes Manuales:** Puntos añadidos/retirados por soporte (ver Herramientas de Soporte).

### C. Logros (Badges)
Visualización de la vitrina de trofeos del usuario:
*   **Desbloqueados:** Iconos a todo color.
*   **Bloqueados:** Iconos en escala de grises u opacidad reducida.
*   **Detalle:** Al pasar el cursor, mostrar fecha de obtención y criterio cumplido.

---

## 4. Herramientas de Soporte Técnico

Panel de acciones críticas para la resolución de incidencias y gestión de cuentas. Estas acciones deben generar un registro en el `Audit Log`.

### A. Gestión de Acceso y Seguridad
*   **Restablecer Contraseña:** Envía un email con un enlace de recuperación seguro (Magic Link).
*   **Forzar Logout:** Cierra la sesión del usuario en todos los dispositivos (útil en caso de robo de cuenta).
*   **Bloqueo (Ban):**
    *   Interruptor para desactivar la cuenta.
    *   Campo obligatorio para "Motivo del bloqueo" (ej. Fraude, Comportamiento abusivo).
    *   El usuario bloqueado ve un mensaje específico al intentar entrar.

### B. Ajustes de Saldo (Compensaciones)
Herramienta para corregir errores o compensar malas experiencias:
*   **Acción:** Sumar o Restar puntos manualmente.
*   **Justificación:** Campo de texto obligatorio para explicar el motivo (ej. "Compensación por retraso en pedido #12345").
*   **Notificación:** Opción para enviar una notificación push automática informando del ajuste ("¡Te hemos regalado 500 puntos por las molestias!").

### C. Comunicación Directa
*   **Enviar Email:** Formulario para enviar un correo electrónico al usuario desde la plataforma (usando plantillas predefinidas o texto libre).
*   **Notas Internas:** Área de texto para que los agentes dejen notas visibles solo para otros miembros del staff (ej. "Cliente llamó muy enfadado, tratar con delicadeza").

---

## 5. Consideraciones de Diseño (UI/UX)

Basado en el `DESIGN_SYSTEM.md`, la interfaz del CRM debe mantener la coherencia visual:

*   **Modo Oscuro:** Fondo principal `#1A1A1A` y tarjetas de contenido en `#2C2C2C`.
*   **Tipografía:**
    *   Títulos de secciones en `Truculenta_700Bold`.
    *   Datos y tablas en `RobotoCondensed_400Regular`.
*   **Colores de Estado:**
    *   **Activo/VIP/Éxito:** `#4CAF50` (Verde).
    *   **Bloqueado/Error/Deuda:** `#FF6B6B` (Rojo).
    *   **Acciones Principales:** Botones en Naranja `#F76934`.
*   **Interactividad:** Uso de sombras sutiles (`#2C2C2C` con elevación) para separar las secciones de la ficha 360º.
