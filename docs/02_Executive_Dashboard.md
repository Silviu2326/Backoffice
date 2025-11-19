# Especificación del Dashboard Ejecutivo (Business Intelligence)

Este documento define los requerimientos visuales, funcionales y de datos para el **Dashboard Ejecutivo** de Mr. CoolCat. Este panel sirve como el centro de mando principal para los administradores, proporcionando una visión holística del rendimiento del negocio en tiempo real.

## 1. Estilo y Diseño Visual

Siguiendo el `DESIGN_SYSTEM.md`, el dashboard debe implementar una estética **Dark Mode** moderna y profesional.

*   **Fondo del Dashboard:** `#1A1A1A` (Gris muy oscuro).
*   **Contenedores (Widgets/Cards):** `#2C2C2C` con bordes redondeados (`20px`) y sombras sutiles.
*   **Tipografía:** `Truculenta` para títulos de widgets y cifras clave; `Roboto Condensed` para etiquetas y tablas.
*   **Paleta de Datos:**
    *   *Serie Principal (Ventas/Usuarios):* `#F76934` (Naranja Mr. CoolCat).
    *   *Positivo/Crecimiento:* `#4CAF50` (Verde).
    *   *Negativo/Alerta:* `#FF6B6B` (Rojo).
    *   *Informativo:* `#6366F1` (Índigo).

---

## 2. Controles Globales

Ubicados en la parte superior del dashboard (Header), afectan a todos los widgets y métricas mostrados.

### Selector de Rango de Fechas
*   **Tipo:** Date Range Picker.
*   **Presets:** "Hoy", "Ayer", "Últimos 7 días", "Últimos 30 días", "Este Mes", "Mes Anterior".
*   **Comportamiento:** Al cambiar, recarga asíncronamente todos los componentes del dashboard.

---

## 3. KPIs Financieros y de Ventas (Fila Superior)

Tarjetas de alto impacto visual (`Metric Cards`) que muestran el estado de salud financiera inmediata.

| KPI / Métrica | Descripción | Visualización | Fuente de Datos |
| :--- | :--- | :--- | :--- |
| **Ingresos Totales** | Suma de ventas (Gross) vs Netos (descontando impuestos/devoluciones). | **Cifra Grande** + Indicador de % de cambio vs periodo anterior (flecha verde/roja). | `orders` |
| **Ticket Medio (AOV)** | Promedio de valor de carrito pagado. | Cifra Moneda (€). Mini gráfico de línea (sparkline) en fondo. | `orders` (Total / Count) |
| **Tasa de Conversión** | % de sesiones/carritos que terminan en pedido pagado. | Gráfico de medidor (Gauge) o Porcentaje simple. | `audit_logs` (sessions) vs `orders` |
| **Pedidos Totales** | Número absoluto de transacciones completadas. | Cifra Entera. | `orders` |

---

## 4. Widgets Operativos (Gestión Crítica)

Sección destinada a la acción inmediata. Deben resaltar problemas que requieren atención del *Store Manager*.

### A. Alertas de Pedidos (Pipeline Health)
*   **Visual:** Lista compacta o tarjetas de estado.
*   **Métrica Crítica:** "Pedidos en Alerta" (Estado ≠ Entregado/Cancelado por > 48 horas).
*   **Color de Alerta:** `#FF6B6B` (Rojo) parpadeante o destacado si el contador > 0.
*   **Acción:** Clic lleva a la vista filtrada de Pedidos.

### B. Monitor de Inventario (Low Stock)
*   **Visual:** Tabla simplificada con los Top 5 productos en riesgo.
*   **Columnas:** Nombre Producto, Stock Actual, Stock Mínimo.
*   **Filtro:** Solo mostrar productos con `< 10` unidades (Stock Crítico).
*   **Acción:** Botón rápido "Ver Inventario" o "Reabastecer".

---

## 5. Gráficos de Análisis (Business Intelligence)

Visualizaciones para entender tendencias a lo largo del tiempo.

### A. Tendencia de Ventas (Revenue Trend)
*   **Tipo:** Gráfico de Línea (Line Chart) o Área (Area Chart).
*   **Ejes:** X = Tiempo (Días/Semanas), Y = Valor en €.
*   **Series:**
    1.  Ventas Periodo Actual (Línea Naranja Solida `#F76934`).
    2.  Ventas Periodo Anterior (Línea Gris Punteada, para comparación).
*   **Tooltip:** Al pasar el mouse, mostrar desglose diario.

### B. Retención de Usuarios (Cohorts)
*   **Tipo:** Mapa de Calor (Heatmap) o Tabla de Cohortes.
*   **Objetivo:** Visualizar qué % de usuarios que se registraron en el "Mes X" siguen activos en el "Mes X+1, X+2...".
*   **Colores:** Escala de Naranja (Mayor retención = Naranja más intenso).

### C. Embudo de E-commerce
*   **Tipo:** Funnel Chart (Embudo).
*   **Pasos:**
    1.  Visita App.
    2.  Añadir al Carrito.
    3.  Checkout Iniciado.
    4.  Pago Completado.
*   **KPI:** Drop-off rate entre pasos.

---

## 6. Comunidad y Gamificación

Métricas para el *Marketing Lead* sobre el compromiso (engagement) de los usuarios.

### A. Actividad de Usuarios (Active Users)
*   **Métricas:**
    *   **DAU:** Daily Active Users (Hoy).
    *   **MAU:** Monthly Active Users (Últimos 30 días).
    *   **Stickiness:** Ratio DAU/MAU %.

### B. Leaderboards y Gamificación
*   **Widget:** "Top Jugadores Beer Run".
    *   Lista de Top 5 usuarios por puntuación hoy/semana.
*   **Widget:** "Logros Desbloqueados".
    *   Contador total de insignias ganadas en el periodo.
    *   Gráfico de barras horizontales con los 3 logros más comunes del periodo.

### C. Top Clientes (Big Spenders)
*   **Widget:** Lista de usuarios ordenados por gasto total en el periodo.
*   **Datos:** Avatar, Nombre, Total Gastado, Nivel de Lealtad.

---

## 7. Disposición (Layout Grid Sugerido)

Para pantallas de escritorio (Desktop 1080p+):

```
[ Header: Título + Date Range Picker ]

[ KPI Card 1 ] [ KPI Card 2 ] [ KPI Card 3 ] [ KPI Card 4 ]  <-- Fila 1

[         Gráfico Principal de Ventas (2/3 ancho)         ] [ Alertas Pedidos (1/3) ] <-- Fila 2

[    Inventario Crítico (1/3)    ] [   Funnel (1/3)       ] [  Actividad Usuarios (1/3) ] <-- Fila 3

[         Gamificación / Top Users (1/2)                  ] [  Mapa de Calor Retención (1/2) ] <-- Fila 4
```
