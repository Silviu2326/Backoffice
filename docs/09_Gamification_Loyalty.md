# Módulo de Gamificación y Lealtad - Especificación Técnica

## 1. Descripción General
Este módulo gestiona todo el ecosistema de engagement y retención de usuarios de la aplicación Mr. CoolCat. Su objetivo es incentivar el comportamiento recurrente mediante recompensas, competición y reconocimiento visual. El sistema permite a los administradores ajustar la economía de puntos, crear desafíos (logros) y equilibrar la dificultad de los minijuegos integrados.

---

## 2. Motor de Reglas de Puntos (Loyalty Engine)

El núcleo del sistema de lealtad define cómo los usuarios ganan y gastan su moneda virtual (Puntos CoolCat).

### A. Configuración de Ratios Base
El administrador debe poder definir la tasa de conversión global:
*   **Ratio de Adquisición (Earn Rate):** Cantidad de puntos ganados por cada Euro gastado (ej. `1 EUR = 10 Puntos`).
*   **Ratio de Redención (Burn Rate):** Valor de los puntos al canjearlos por descuentos (ej. `100 Puntos = 1 EUR de descuento`).

### B. Acciones Bonificadas (Trigger-based Rewards)
Configuración de recompensas fijas por acciones específicas que no son necesariamente transaccionales:
*   **Registro de Cuenta:** (ej. +50 pts).
*   **Completar Perfil:** (ej. +20 pts al añadir fecha de nacimiento/teléfono).
*   **Primera Compra:** Bonus extra sobre los puntos base.
*   **Escribir Reseña:** (ej. +10 pts por reseña aprobada).
*   **Social Share:** (ej. +5 pts por compartir un producto/logro, limitado a 1 vez al día).

### C. Gestión de Saldos
*   **Historial Transaccional:** Vista detallada en el CRM de cada usuario (`loyalty_transactions`) mostrando ingresos (verde) y egresos (rojo).
*   **Ajustes Manuales:** Herramienta para Soporte al Cliente para sumar/restar puntos manualmente (requiere nota de auditoría obligatoria).

---

## 3. Sistema de Logros e Insignias (Badges)

El sistema de logros utiliza un constructor de condiciones para "gamificar" el consumo y la interacción.

### A. Editor de Logros
Cada logro se compone de:
*   **Metadatos:** Nombre (ej. "Lupulero Experto"), Descripción (ej. "Prueba 5 IPAs diferentes").
*   **Identificador Único (Slug):** `badge_ipa_lover_lvl1`.
*   **Activos Visuales:**
    *   *Icono Bloqueado:* Imagen en escala de grises o silueta (SVG/PNG).
    *   *Icono Desbloqueado:* Imagen a todo color (SVG/PNG).

### B. Constructor de Reglas (Conditions Builder)
Interfaz visual para definir la lógica de desbloqueo sin necesidad de código (No-Code/Low-Code):
*   **Variables:** `Product.Category`, `Order.Total`, `User.EventAttendance`, `Game.BeerRun.Score`.
*   **Operadores:** `EQUALS`, `GREATER_THAN`, `CONTAINS`, `COUNT`.
*   **Ejemplo de Regla:**
    ```sql
    IF (Count(Orders) WHERE Item.Category == 'IPA') >= 5 THEN UNLOCK 'Lupulero Experto'
    ```

### C. Recompensas por Logro
Vincular un premio al desbloqueo del logro:
*   Puntos extra instantáneos.
*   Cupón de descuento generado automáticamente.
*   Acceso a un nivel VIP (Tier).

---

## 4. Configuración de Juegos (Arcade Config)

Parámetros ajustables en caliente (Hot-Config) para balancear la dificultad y las recompensas de los minijuegos sin actualizar la app.

### A. Beer Run (Endless Runner)
*   **Física y Dificultad:**
    *   *Velocidad Base:* Velocidad inicial del personaje.
    *   *Tasa de Aceleración:* Cuánto aumenta la velocidad por segundo.
    *   *Densidad de Obstáculos:* Frecuencia de aparición de barriles/enemigos.
*   **Economía del Juego:**
    *   *Monedas In-Game:* Ratio de conversión de monedas recogidas en el juego a Puntos de Lealtad reales (ej. `10 monedas recogidas = 1 Punto CoolCat`).
    *   *Límite Diario:* Puntos máximos que se pueden ganar jugando al día (para evitar farming abusivo).

### B. Quiz de Recomendación (Sommelier Digital)
*   **Gestión de Preguntas:**
    *   CRUD de preguntas y respuestas.
    *   Mapeo de respuestas a atributos de producto (ej. "¿Te gusta el café?" -> Respuesta "Sí" suma peso a la categoría `Stout/Porter`).
*   **Lógica de Resultados:**
    *   Algoritmo de ponderación para sugerir el "Match Perfecto" del catálogo actual.

---

## 5. Tablas de Clasificación (Leaderboards)

Gestión de la competitividad entre usuarios.

*   **Periodos:** Configuración de torneos (Semanal, Mensual, Histórico).
*   **Reset:** Programación de reinicios de puntuación.
*   **Premios:** Definición automática de recompensas para el Top 3 al finalizar el periodo (ej. "Al cerrar el mes, enviar Cupón de 20€ al #1").
*   **Moderación:** Capacidad de eliminar puntuaciones sospechosas (cheaters) de la tabla.

---

## 6. Modelo de Datos Relacionado

Entidades principales involucradas en la base de datos (`Supabase/PostgreSQL`):

*   `loyalty_config`: Configuración global de ratios y límites.
*   `achievements`: Definiciones de logros y reglas.
*   `user_achievements`: Tabla pivote (User ID, Achievement ID, Date Unlocked).
*   `loyalty_transactions`: Ledger inmutable de puntos (User ID, Amount, Type, Reference ID).
*   `game_sessions`: Registro de partidas (Game Type, Score, Duration, User ID).
*   `game_leaderboards`: Vistas materializadas o tablas de ranking actualizadas periódicamente.
