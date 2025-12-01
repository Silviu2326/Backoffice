# Módulo 6: Gestión de Cartera y Rendimiento

## 1. Visión Técnica Profunda
Este módulo implementa matemáticas financieras rigurosas. La dificultad radica en que el usuario deposita y retira dinero constantemente, lo que distorsiona el cálculo de rentabilidad simple.
Debemos implementar **Time-Weighted Return (TWR)** para juzgar la calidad de las inversiones, y **Money-Weighted Return (MWR/XIRR)** para el resultado personal real.

## 2. Arquitectura de Archivos Detallada

### 2.1 API Layer (`src/features/portfolio/api/`)

#### `financialMath.ts` (Utilidades Puras)
*   **Algoritmos**:
    *   `calculateTWR(periods: Period[])`: Multiplica `(1 + r1) * (1 + r2) ... - 1`. Elimina el impacto de flujos de efectivo externos.
    *   `calculateXIRR(transactions: CashFlow[])`: Usa el método de Newton-Raphson para encontrar la tasa interna de retorno extendida.
    *   `adjustForInflation(nominalValue, inflationIndex)`: `Real = Nominal / Index`.

#### `portfolioService.ts`
*   **Agregación**:
    *   Normaliza datos de APIs dispares (Plaid para bancos, DriveWealth para acciones, Zillow mock para casa).
    *   Convierte todo a una moneda base (EUR) usando tipos de cambio históricos si hay activos en USD.

### 2.2 Components Layer (`src/features/portfolio/components/`)

#### `PerformanceChart.tsx`
*   **Feature**: "Benchmarking Dinámico".
*   **Lógica**:
    *   Dibuja la curva del usuario.
    *   Dibuja la curva "S&P 500" ajustada a los *mismos* flujos de caja del usuario (para que la comparación sea justa).
    *   Usa `Recharts` con `ReferenceArea` para sombrear periodos de recesión.

#### `PortfolioCompositionPie.tsx`
*   **Interacción**:
    *   Drill-down: Al hacer click en "Acciones", el gráfico se transforma (anima) para mostrar el desglose de "Tecnología", "Salud", etc.

#### `RiskAdjustmentControls.tsx`
*   **Control Deslizante de Asignación**:
    *   Muestra la asignación actual vs objetivo.
    *   Ej: "Bonos: 10% -> Objetivo: 20%".
    *   Calcula las órdenes necesarias: "Comprar 500€ de BND".

#### `MacroImpactWidget.tsx`
*   **Datos en Tiempo Real**:
    *   Conecta con API de Truflation.
    *   Muestra un "Contador Geiger" de inflación.
    *   Visualiza cómo el efectivo pierde valor: Un gráfico de una barra de 1000€ derritiéndose visualmente con el tiempo.

### 2.3 Pages Layer (`src/features/portfolio/pages/`)

#### `PortfolioPage.tsx`
*   **Estrategia de Carga**:
    *   Lazy Loading agresivo para los gráficos históricos pesados.
    *   Prioriza la carga del "Total Equity" (Patrimonio Total) en el header.

## 3. Modelo de Datos de Activos
```typescript
interface Asset {
  ticker: string;
  quantity: number;
  currentPrice: number;
  costBasis: number; // Precio medio de compra
  currency: string;
  assetClass: 'EQUITY' | 'FIXED_INCOME' | 'CRYPTO' | 'REAL_ESTATE';
  sector?: string;
}
```

## 4. Testing
*   **Math Verification**: Los tests unitarios para `calculateXIRR` son críticos. Deben probarse contra resultados conocidos de Excel.
*   **Edge Cases**: Precios cero, cantidades negativas (shorts), división por cero en TWR.
