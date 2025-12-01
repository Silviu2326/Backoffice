# Módulo 6: Compromiso y Gamificación Cooperativa

## 1. Visión General Técnica
El foco técnico aquí es la **Concurrencia** y el **Tiempo Real**. Si 50 personas sincronizan sus relojes a la vez (ej. por la mañana), el sistema debe actualizar las barras de progreso grupales instantáneamente sin "Race Conditions".

## 2. Arquitectura Real-Time (WebSockets)

### Eventos Socket.io / Supabase Realtime
*   Channel: `team_challenges:{teamId}`
*   Eventos:
    *   `SCORE_UPDATE`: Payload `{ delta: +50, newTotal: 1450, contributorHash: "..." }`
    *   `NEW_ACHIEVEMENT`: Payload `{ badgeId: "early_bird", teamName: "..." }`

### Manejo de Estados (Optimistic UI)
*   Cuando el frontend detecta una nueva sincronización de datos, actualiza la UI localmente *antes* de recibir confirmación del servidor ("Optimistic Update") para sensación de velocidad.
*   Reconciliación: Si el servidor rechaza (ej. dato duplicado), la UI hace rollback.

## 3. Lógica de "Squad Quests" (Backend)

### Prevención de Fraude
*   Validación de límites físicos: Nadie duerme 20 horas un martes. Si `sleep > 14h`, marcar como `SUSPICIOUS` y no sumar al reto hasta revisión manual o confirmación secundaria.
*   Deduplicación: Hash único por día/usuario para evitar sumar dos veces la misma siesta.

### Generación de Feed Anónimo
Uso de Templates con variables.
*   Template: `"{TEAM_ICON} El equipo {TEAM_NAME} ha completado el {PCT}% del reto '{CHALLENGE}'!"`
*   No usar nombres de usuarios. Usar avatares generados aleatoriamente o el logo del equipo.

## 4. UI/UX Gamificada

### Componentes Visuales
*   **Confeti:** Usar `react-confetti` cuando se alcanza un hito.
*   **Animaciones:** Librería `Framer Motion` para barras de progreso que se llenan suavemente.

## 5. Estructura de Archivos (Expandida)

```text
src/features/peak-performance/gamification/
├── api/
│   ├── challengeService.ts
│   └── reactionService.ts
├── components/
│   ├── Visuals/
│   │   ├── ConfettiExplosion.tsx
│   │   ├── LevelUpAnimation.tsx
│   │   └── AnimatedProgressBar.tsx
│   ├── Feed/
│   │   ├── FeedStream.tsx      # Lista virtualizada con websockets
│   │   ├── KudoButton.tsx      # Botón interactivo con contador
│   │   └── TeamAvatar.tsx
├── hooks/
│   └── useTeamSocket.ts        # Hook para suscripción a eventos
├── context/
│   └── ChallengeContext.tsx
└── utils/
│   ├── gamificationEngine.ts   # Lógica de puntos y medallas
│   └── textFormatter.ts        # Anonimizador de mensajes
└── pages/
    ├── ChallengeArenaPage.tsx
    └── WellnessWallPage.tsx
```
