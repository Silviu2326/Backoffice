# Módulo 3: El Centro de Comando Empresarial (Interfaz B2B para Gerentes)

## 1. Visión General Técnica
El desafío principal es el **Big Data Performance** y la **Integridad Estadística**. No podemos calcular promedios de miles de registros en tiempo real en cada request. Se requiere una estrategia de *Pre-cálculo* y *Vistas Materializadas*.

## 2. Optimización de Base de Datos

### Vistas Materializadas (PostgreSQL)
Para evitar calcular promedios históricos cada vez que un manager carga el dashboard.

```sql
CREATE MATERIALIZED VIEW daily_team_stats AS
SELECT 
    u.team_id,
    m.date,
    COUNT(m.user_id) as reporting_members,
    AVG(m.normalized_score) as avg_readiness,
    AVG(m.sleep_seconds) as avg_sleep,
    STDDEV(m.normalized_score) as variability -- Para detectar disparidad
FROM daily_metrics m
JOIN users u ON m.user_id = u.id
GROUP BY u.team_id, m.date
WITH DATA;

-- Refresh strategy: Cron job cada hora o trigger tras ingesta masiva
-- REFRESH MATERIALIZED VIEW CONCURRENTLY daily_team_stats;
```

## 3. Lógica de Simulación "What-If" (Recursos Biológicos)

### Algoritmo de Impacto de Carga
Este algoritmo corre en el backend (Node.js/Python) o vía Edge Functions.

**Input:**
*   `TeamState`: { avgRecovery: 70, size: 10 }
*   `ProjectLoad`: { hoursPerDay: 2, durationDays: 10, intensityMultiplier: 1.5 }

**Proceso:**
1.  **Carga Base:** Asumimos carga normal de trabajo (ej. 6h efectivas).
2.  **Carga Extra:** `2h * 1.5 (High Intensity) = 3h` de fatiga efectiva extra.
3.  **Loop de Simulación (Día 1 a 10):**
    *   `Recovery_Tomorrow = Recovery_Today - (Load_Today - Resilience_Factor)`
    *   Si `Recovery < 30` -> Incrementa contador `BurnoutRisk`.

**Output:**
*   Curva de degradación proyectada.
*   Probabilidad de fallo (Burnout > 50% de miembros).

## 4. UI/UX Avanzada

### Burnout Heatmap (Grid Virtualizado)
Si la empresa tiene 50 equipos y visualizamos 52 semanas, son 2600 celdas.
*   Usar `react-window` o `react-virtuoso` para renderizar solo las celdas visibles.
*   Implementar "Lazy Loading" de datos históricos al hacer scroll horizontal.

### Reportes Exportables (PDF/CSV)
Generación de reportes ejecutivos automatizados.
*   Librería backend: `Puppeteer` o `PDFKit` para generar PDFs bonitos con gráficos vectoriales.
*   Contenido: "Informe de Salud Organizacional Q3 2025".

## 5. Seguridad y Roles
*   Middleware estricto: `ensureManagerRole` y `ensureTeamAccess`.
*   Un manager del Equipo A no debe poder consultar la API `/api/teams/B/stats`.
*   Validación de alcance en cada endpoint:
    ```typescript
    if (!currentUser.managedTeams.includes(requestedTeamId)) {
        throw new ForbiddenError("Acceso denegado a este equipo");
    }
    ```

## 6. Estructura de Archivos (Expandida)

```text
src/features/peak-performance/manager-dashboard/
├── api/
│   ├── analyticsService.ts
│   └── simulationEngine.ts    # Lógica pesada de cálculo
├── components/
│   ├── Heatmap/
│   │   ├── VirtualizedHeatmapGrid.tsx # Optimizada
│   │   ├── HeatmapLegend.tsx
│   │   └── CellDetailTooltip.tsx
│   ├── Simulation/
│   │   ├── ResourceAllocationBoard.tsx
│   │   └── ScenarioComparisonChart.tsx # Gráfico Línea A vs Línea B
│   ├── Export/
│   │   ├── ReportGeneratorModal.tsx
│   │   └── PDFPreview.tsx
├── context/
│   └── ManagerDashboardContext.tsx # Filtros globales (fechas, depts)
├── utils/
│   ├── statisticsMath.ts      # Cálculo de desviaciones, percentiles
│   └── colorScales.ts         # D3 scales para heatmaps
└── pages/
    ├── StrategicOverviewPage.tsx
    └── CapacityPlanningPage.tsx
```
