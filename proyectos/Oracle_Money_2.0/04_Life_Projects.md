# Módulo 4: Life Projects OS (Gestión de Life-ROI)

## 1. Visión Técnica Profunda
Este módulo gestiona la **Planificación Financiera Basada en Objetivos (Goals-Based Financial Planning)**.
Técnicamente, combina un motor de cálculo de Valor Presente Neto (NPV) para el capital humano con un gestor de proyectos tipo Gantt.
Introduce el concepto de "Curva de Utilidad de Salud" para ponderar el valor de los gastos.

## 2. Arquitectura de Archivos Detallada

### 2.1 API Layer (`src/features/life-roi/api/`)

#### `actuarialService.ts`
*   **Fuente de Datos**:
    *   Contiene tablas estáticas de mortalidad/esperanza de vida (ej. Tablas INE o Social Security).
    *   `getLifeExpectancy(age, gender)`: Retorna años restantes estimados.
*   **Lógica de Capital Humano**:
    *   `calculateHumanCapital(currentIncome, age, retirementAge, growthRate, discountRate)`:
        *   Fórmula: Sumatoria de `(Income_n / (1 + discountRate)^n)` desde hoy hasta jubilación.
        *   Este valor representa "El bono que eres tú mismo".

#### `lifeRoiDTOs.ts`
*   **Interfaces**:
    ```typescript
    export interface LifeProject {
      id: string;
      name: string; // ej. "Boda", "Casa"
      cost: number;
      targetAge: number;
      category: 'ESSENTIAL' | 'EXPERIENCE' | 'ASSET';
      priority: 1 | 2 | 3;
    }

    export interface AssetCurvePoint {
      age: number;
      financialCapital: number;
      humanCapital: number;
      totalWealth: number; // financial + human
    }
    ```

### 2.2 Components Layer (`src/features/life-roi/components/`)

#### `AssetsMatrixChart.tsx`
*   **Complejidad Visual**:
    *   **Stacked Area Chart**: El área total (Wealth) debe ser la suma visual de Humano + Financiero.
    *   **Interacción**: Al hacer hover sobre una edad (ej. 45 años), un tooltip muestra: "A esta edad, tu dinero trabajará más que tú" (si Capital Financiero > Capital Humano).

#### `LifeGanttChart.tsx`
*   **Implementación**:
    *   Probablemente custom SVG o Canvas debido a la longitud (eje X = 70 años).
    *   **Zooming**: Capacidad de hacer zoom en la década actual ("Los 30s") para precisión de meses, o ver la vida entera ("Vista de Pájaro").
    *   **Collision Detection**: Evitar que dos hitos se solapen visualmente si ocurren el mismo año.

#### `HitoItem.tsx` (Draggable)
*   **Feedback en Tiempo Real**:
    *   Mientras se arrastra el hito a través de la línea de tiempo:
        *   Calcula el impacto en el `Runway` (del Módulo 3) en segundo plano.
        *   Cambia el color del borde: Verde (Viable), Rojo (Te arruina).

#### `ExperienceCalculator.tsx`
*   **Algoritmo "Die With Zero"**:
    *   `Utility = Cost * HealthFactor(Age)`.
    *   `HealthFactor`: Función sigmoide inversa que empieza en 1.0 y cae rápidamente después de los 65-70 años.
    *   Muestra al usuario: "Gastar 5k€ ahora te da 5000 puntos de memoria. Gastarlos a los 70 te dará solo 1200 puntos (por limitaciones de salud)".

### 2.3 Pages Layer (`src/features/life-roi/pages/`)

#### `LifeProjectsPage.tsx`
*   **Sincronización de Datos**:
    *   Carga inicial: Obtiene perfil de usuario (Edad, Salario) y Portafolio actual.
    *   Computa las curvas de activos en el cliente (para evitar latencia).
    *   Renderiza el Gantt y el Gráfico de Activos sincronizados (comparten el mismo eje X de Edad).

## 3. Integración Cross-Module
*   **Conexión con Módulo 3 (Simulador)**: Los proyectos definidos aquí se exportan como "Gastos Programados" para el simulador. Si añades "Comprar Casa" aquí, el simulador de crisis tendrá en cuenta esa salida de efectivo masiva en el año X.

## 4. Testing
*   **Snapshot Testing**: Verificar que la curva de Capital Humano decae correctamente (debe ser 0 a la edad de jubilación).
*   **Logic Testing**: Asegurar que mover un proyecto al futuro reduce su coste en valor presente (debido a la inflación/descuento), pero el sistema debe mostrar el precio nominal futuro estimado.
