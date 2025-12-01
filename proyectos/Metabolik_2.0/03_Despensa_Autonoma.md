# Módulo 3: La Compra Autónoma (Bio-Logística)

## 1. Visión Técnica Profunda
Este módulo implementa un **Sistema de Planificación de Recursos Biológicos (Bio-ERP)**.
Transforma señales de demanda biológica (Biomarcadores) en órdenes de suministro logístico (Carritos de compra).
La clave es la **Resolución de Conflictos**: ¿Qué pasa si el usuario necesita Hierro (Carne roja) pero tiene Colesterol alto (Evitar grasas saturadas)? El motor debe encontrar el óptimo local (ej. Hígado de pollo o suplementos específicos).

## 2. Arquitectura de Archivos (`src/features/auto-pantry/`)

### 2.1 Motor de Lógica (`logic/procurementEngine.ts`)

#### Algoritmo de Selección de Productos (Pseudo-código)
```typescript
function resolveCart(biomarkers, restrictions, budget) {
  // 1. Generar lista de nutrientes necesarios
  let nutrientGaps = analyze(biomarkers); 
  
  // 2. Buscar candidatos (Alimentos ricos en X)
  let candidates = database.findSources(nutrientGaps);
  
  // 3. Filtrar por Restricciones "Duras" (Alergias, Fármacos)
  candidates = candidates.filter(c => !isContraindicated(c, activeMeds));
  
  // 4. Optimizar por Restricciones "Blandas" (Preferencias, Dieta)
  candidates = scoreByPreference(candidates, userProfile);
  
  // 5. Solver de la Mochila (Knapsack Problem) para Presupuesto
  let cart = optimizeKnapsack(candidates, budget, 'nutrientDensity');
  
  return cart;
}
```

### 2.2 API Adapters (`api/retailers/`)

#### `UnifiedCartInterface.ts`
*   Patrón **Adapter** para normalizar APIs de supermercados.
*   Métodos: `searchProduct(query)`, `addToCart(sku, qty)`, `checkout()`.
*   **Implementaciones**:
    *   `KrogerAdapter`: Usa API pública REST.
    *   `InstacartAdapter`: Usa web scraping controlado o API privada (si hay partnership).
    *   `GenericListAdapter`: Fallback a lista de texto simple si no hay integración.

### 2.3 Componentes UI (`components/`)

#### `NutrientReasoningCard.tsx`
*   **Explicabilidad**:
    *   Componente crítico para la confianza.
    *   Estructura visual:
        *   **Problema**: "Vitamina D Baja (18 ng/mL)" (Icono Alerta).
        *   **Solución**: "Salmón Salvaje" (Foto Producto).
        *   **Ciencia**: "El salmón aporta 600 UI por ración".

#### `BudgetOptimizerWidget.tsx`
*   **Interactividad**:
    *   Slider de presupuesto.
    *   Al reducir el dinero, la UI anima la sustitución de productos:
        *   "Filete de Ternera" ($20) -> "Carne Picada Magra" ($8) -> "Lentejas" ($2).
    *   Muestra el impacto en el "Score de Cobertura Nutricional".

## 3. Estado Global (`usePantryStore.ts`)
```typescript
interface PantryState {
  deficiencies: BiomarkerDeficiency[];
  draftCart: CartItem[];
  blacklistedIngredients: string[]; // Definido por Farmacogenética
  budgetLimit: number;
  deliveryWindow: Date;
  
  // Acciones
  regenerateCart: () => Promise<void>;
  swapItem: (originalId: string) => Promise<void>; // Busca alternativa
}
```