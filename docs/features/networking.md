# Módulo 3: Networking & Gestión de Partners

## 1. Descripción General

Este módulo se centra en la gestión de las relaciones profesionales del freelancer, más allá de los clientes directos. Su objetivo principal es administrar una red de colaboradores (subcontratistas) y gestionar el sistema de referidos y comisiones. Permite al usuario escalar su trabajo delegando tareas y manteniendo un registro claro de las obligaciones financieras derivadas de las referencias de clientes.

**Objetivo:** Convertir la red de contactos en un activo gestionable, optimizando la subcontratación y asegurando el cumplimiento de acuerdos de comisiones.

## 2. Requerimientos Funcionales

### 2.1. Directorio de Talentos (Subcontratistas)
El sistema debe permitir mantener una base de datos privada de profesionales de confianza (Partners).

*   **Gestión de Perfiles:**
    *   Crear, leer, actualizar y eliminar (CRUD) perfiles de profesionales.
    *   Datos básicos: Nombre, Especialidad (Copywriter, DevOps, Traductor, etc.), Contacto.
*   **Campos Privados de Evaluación:**
    *   **Tarifa Hora:** Registro del coste por hora del profesional.
    *   **Calidad de Trabajo:** Puntuación (ej. 1-5 estrellas).
    *   **Fiabilidad:** Indicador de confianza o puntualidad.
    *   **Notas Internas:** Espacio para comentarios cualitativos sobre la experiencia de trabajo.
*   **Asignación de Trabajo (Órdenes de Trabajo):**
    *   Capacidad para generar "Órdenes de Trabajo" vinculadas a Proyectos existentes (Módulo 4).
    *   Seguimiento del estado de la asignación (Asignado, En Progreso, Completado, Pagado).

### 2.2. Sistema de Comisiones y Referidos
El sistema debe rastrear el origen de los clientes y calcular las compensaciones acordadas.

*   **Rastreo de Origen (Lead Source):**
    *   Vincular un Cliente o Proyecto a un "Referidor" (que puede ser un contacto del Directorio de Talentos o un contacto externo).
*   **Calculadora de Comisiones:**
    *   Definir acuerdos de comisión (ej. "% del proyecto", "Cantidad fija", "Recurrente").
    *   **Ejemplo:** "10% del primer proyecto con el cliente X".
*   **Gestión de Pagos de Comisiones:**
    *   Alertas automáticas: Cuando se cobra una factura de un cliente referido, el sistema debe recordar pagar la comisión al referidor.
*   **Historial de "Deuda de Gratitud":**
    *   Registro visual de favores debidos o comisiones pendientes de pago.

## 3. Arquitectura Técnica

### 3.1. Estructura de Archivos
La implementación debe seguir estrictamente la siguiente estructura de directorios dentro de `src/features/networking/`:

```text
src/features/networking/
├── api/
│   ├── commissions.ts      # Endpoints y lógica de comisiones
│   ├── partners.ts         # Endpoints para gestión de partners/talentos (CRUD)
│   └── work-orders.ts      # Gestión de órdenes de trabajo
├── components/
│   ├── CommissionCalculator.tsx # Componente para calcular/definir reglas de comisión
│   ├── ReferralTree.tsx        # Visualización de quién refirió a quién
│   ├── PartnerCard.tsx         # Tarjeta de resumen de un profesional
│   ├── PartnerRating.tsx       # Componente de estrellas/puntuación
│   └── WorkOrderForm.tsx       # Formulario para asignar tareas
├── pages/
│   ├── NetworkingDashboard.tsx # Vista principal del módulo
│   ├── PartnerDirectory.tsx    # Listado y filtrado de profesionales
│   ├── PartnerProfile.tsx      # Detalle de un profesional específico
│   └── CommissionsLog.tsx      # Historial y gestión de pagos de referidos
└── types/
    └── index.ts            # Definiciones de tipos TypeScript (Partner, Referral, Commission, etc.)
```

### 3.2. Lógica de Cálculo de Comisiones (Pseudocódigo)

El sistema calcula las comisiones basándose en reglas predefinidas cuando se registra un pago de un cliente. Esta lógica asegura que no se pierdan oportunidades de compensar a los referidores.

```typescript
// Función pura para determinar el monto
function calcularComision(facturaPagada: Invoice, regla: CommissionRule): number {
  // 1. Validar si la regla aplica a esta factura específica
  if (regla.scope === 'project-specific' && regla.targetProjectId !== facturaPagada.projectId) {
    return 0;
  }

  // 2. Verificar si es un pago único y ya se pagó previamente
  if (regla.scope === 'one-time' && regla.hasBeenPaid) {
    return 0;
  }

  let montoComision = 0;

  // 3. Calcular basado en el tipo de regla
  if (regla.type === 'percentage') {
    // Ejemplo: 10% del subtotal de la factura (excluyendo impuestos)
    montoComision = facturaPagada.subtotal * (regla.value / 100);
  } else if (regla.type === 'fixed') {
    // Ejemplo: $50 fijos por cierre o hito
    montoComision = regla.value;
  }

  // 4. Ajustes finales (ej. validar topes máximos si existieran)
  return montoComision;
}

// Workflow: Evento Trigger cuando una factura cambia a estado 'PAID'
onInvoicePaid(invoice) {
  const proyecto = getProject(invoice.projectId);
  // Identificar quién refirió el proyecto o cliente
  const referidor = proyecto.referralSource || proyecto.client.referralSource;

  if (referidor) {
    // Obtener reglas activas para este par Referidor-Proyecto
    const reglas = getActiveCommissionRules(referidor.id, proyecto.id);
    
    foreach (regla in reglas) {
      const monto = calcularComision(invoice, regla);
      
      if (monto > 0) {
        // Registrar la deuda/comisión pendiente
        createCommissionPayable({
          referrerId: referidor.id,
          sourceInvoiceId: invoice.id,
          amount: monto,
          currency: invoice.currency,
          status: 'pending', // Pendiente de pago al partner
          generatedAt: now(),
          dueDate: calculateDueDate(now(), 'NET30') // Ejemplo: Pagar comisión a 30 días
        });
        
        // Opcional: Notificar al usuario que debe pagar una comisión
        notifyUser(`Comisión generada de ${monto} para ${referidor.name}`);
      }
    }
  }
}
```

### 3.3. Modelo de Datos y Tipos

#### Interfaces Principales

Se han definido interfaces robustas para manejar la complejidad de las relaciones y los acuerdos financieros.

```typescript
// Representa un socio, colaborador, subcontratista o talento en la red
interface Partner {
  id: string;
  type: 'individual' | 'agency';
  name: string;
  email: string;
  role: string; // e.g., "DevOps", "Copywriter"
  skills: string[]; // Etiquetas de habilidades para búsquedas
  status: 'active' | 'inactive' | 'blacklisted';
  
  // Datos Financieros
  hourlyRate?: number;
  currency?: string;
  billingDetails?: {
    taxId: string;
    method: 'bank_transfer' | 'paypal' | 'crypto';
    instructions: string;
  };
  
  // Métricas de rendimiento y confianza
  performance: {
    rating: number; // 1-5
    reliabilityScore: number; // 1-100%
    projectsCompleted: number;
    totalReferrals: number; // Cuántos clientes nos ha traído
  };

  notes: string; // Notas internas privadas
  createdAt: string;
  updatedAt: string;
}

// Representa el acto de referir a un cliente o proyecto (Lead Source)
interface Referral {
  id: string;
  partnerId: string; // Quién refirió (Partner)
  entityType: 'client' | 'project'; // Qué refirió
  entityId: string; // ID del Cliente o Proyecto referido
  
  dateReferred: string;
  status: 'pending_conversion' | 'converted' | 'lost';
  
  // Acuerdo de comisión específico para este referido (Snapshotted or Linked)
  commissionAgreementId?: string; 
}

// Regla para calcular comisiones
interface CommissionRule {
  id: string;
  referrerId: string; // Link a Partner
  type: 'percentage' | 'fixed';
  value: number; // e.g., 10 (para 10%) o 100 (para $100)
  scope: 'one-time' | 'recurring' | 'project-specific';
  targetProjectId?: string; // Si aplica solo a un proyecto específico
  active: boolean;
}

// Historial de comisiones generadas (Deuda)
interface CommissionEntry {
  id: string;
  partnerId: string;
  referralId: string;
  amount: number;
  currency: string;
  reason: string; // "Comisión por Factura #123 - Proyecto Alpha"
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paymentDate?: string;
  createdAt: string;
}
```

### 3.4. Diseño de Base de Datos: Relaciones Grafo

Para modelar la red de contactos ("Quién conoce a quién") de manera eficiente, utilizaremos una tabla de relaciones que permite construir un grafo dirigido. Esto es vital para entender la profundidad de la red (Networking de 2do o 3er grado).

**Tabla: `network_connections`**

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único de la conexión. |
| `source_partner_id` | UUID | El ID del partner que "conoce" o introduce (Nodo A). |
| `target_partner_id` | UUID | El ID del partner que es conocido (Nodo B). |
| `connection_type` | ENUM | `colleague`, `ex-coworker`, `client`, `mentor`, `friend`. |
| `strength` | INT | 1-5, indicador subjetivo de la fuerza de la relación. |
| `notes` | TEXT | Contexto de la relación (ej. "Trabajamos juntos en empresa X"). |
| `created_at` | TIMESTAMP | Cuándo se registró la conexión en el sistema. |

**Consultas posibles:**
*   *¿A quién conoce mi Partner A que sepa de React?* (Búsqueda en profundidad 1).
*   *¿Cómo llegué a conocer al Cliente Z?* (Trazabilidad inversa del grafo).

### 3.5. Endpoints API

La API sigue principios RESTful para la gestión de recursos.

#### Gestión de Partners
*   `GET /api/networking/partners`: Listar todos los partners. Soporta filtros `?skills=react&rating_gte=4`.
*   `POST /api/networking/partners`: Crear un nuevo perfil de partner.
*   `GET /api/networking/partners/{id}`: Obtener detalles completos de un partner.
*   `PUT /api/networking/partners/{id}`: Actualizar información (ej. nueva habilidad, cambio de tarifa).
*   `DELETE /api/networking/partners/{id}`: Archivar partner (soft delete).

#### Grafo de Conexiones
*   `GET /api/networking/partners/{id}/network`: Obtener las conexiones de 1er grado de un partner.
*   `POST /api/networking/connections`: Crear una relación "quien conoce a quien". Payload: `{ sourceId, targetId, type }`.
*   `DELETE /api/networking/connections/{id}`: Eliminar una relación.

#### Referidos y Comisiones
*   `POST /api/networking/referrals`: Registrar un nuevo referido manualmente.
*   `GET /api/networking/commissions`: Listar todas las comisiones. Filtros: `?status=pending`.
*   `GET /api/networking/commissions/stats`: Obtener métricas (Total pagado, Deuda pendiente, Top referidores).
*   `POST /api/networking/commissions/{id}/pay`: Registrar el pago de una comisión (cambia estado a `paid`).
*   `POST /api/networking/rules`: Crear una nueva regla de comisión para un partner.

## 4. Integración con Otros Módulos

*   **Módulo 1 (CRM):** Los "Referidores" pueden ser contactos existentes en el CRM. Al crear un nuevo cliente, se debe poder seleccionar un "Referido por" desde la lista de Networking.
*   **Módulo 4 (Proyectos):** Las "Órdenes de Trabajo" son esencialmente tareas delegadas de un proyecto principal. Deben ser visibles dentro del detalle del proyecto.
*   **Módulo 7 (Facturación):** Cuando una factura de cliente cambia a estado "Pagada", el sistema debe verificar si existe una regla de comisión activa y generar una alerta o una "Factura de Gasto" borrador para el referidor.

## 5. Consideraciones de UI/UX
*   **Privacidad:** Los campos de evaluación (rating, notas) deben estar visualmente diferenciados para indicar que son internos y nunca visibles para el talento.
*   **Visualización de Red:** Utilizar una librería de gráficos (como React Flow o D3.js) para visualizar el `ReferralTree` si la red crece mucho.
*   **Claridad Financiera:** El dashboard de comisiones debe mostrar claramente "Total Generado por Referidos" vs "Total Pagado en Comisiones".