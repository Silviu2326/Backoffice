# 🔧 Solución: Órdenes no visibles en el Backoffice

## Problema Identificado
Las órdenes existen en la base de datos pero **no se muestran en la página de pedidos** del backoffice.

### Causa Raíz
**Row Level Security (RLS)** está activado en la tabla `orders`, pero no hay políticas configuradas para permitir que los usuarios autenticados vean las órdenes.

- ✅ Service Role Key ve: **1 orden**
- ❌ API Anónima ve: **0 órdenes**

---

## ✅ Solución: Configurar Políticas RLS

### Paso 1: Abrir Supabase SQL Editor
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a "SQL Editor" en el menú lateral

### Paso 2: Ejecutar el SQL
Copia y pega el contenido del archivo `FIX_ORDERS_RLS.sql` y ejecútalo.

**O copia este SQL simplificado:**

```sql
-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (para evitar duplicados)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON orders;

-- Crear políticas para usuarios autenticados
CREATE POLICY "Enable read access for authenticated users" ON orders
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON orders
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON orders
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON orders
    FOR DELETE TO authenticated USING (true);
```

### Paso 3: Verificar
1. Refresca la página del backoffice
2. Ve a la sección "Pedidos"
3. Las órdenes deberían aparecer ahora

---

## 📋 Detalles de la Orden Encontrada

| Campo | Valor |
|-------|-------|
| **Número** | ORD-20251209-000011 |
| **Estado** | completed ✅ |
| **Total** | €42.95 |
| **Customer ID** | NULL (compra de invitado) |
| **Email** | test-customer@ejemplo.com |
| **Stripe Payment** | ✅ succeeded |
| **Fecha** | 9/12/2025, 3:07:34 |

---

## ⚠️ Notas Adicionales

### 1. Órdenes sin Customer ID
La orden encontrada tiene `customer_id: null`. Esto es normal para compras de invitado (guest checkout). El backoffice debería mostrar estas órdenes correctamente ahora.

### 2. Si las órdenes aún no aparecen
Verifica que:
- Estás autenticado en el backoffice
- Tu usuario tiene rol `authenticated` en Supabase
- Las políticas RLS se aplicaron correctamente (revisa en "Table Editor" > "orders" > "Policies")

### 3. Para desarrollo local
Si estás trabajando localmente y quieres desactivar RLS temporalmente:
```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

---

## 🧪 Scripts de Diagnóstico

He creado dos scripts para diagnosticar problemas:

1. **`test-orders-diagnosis.js`** - Verifica órdenes con API key anónima
2. **`test-orders-service-role.js`** - Verifica órdenes con Service Role Key (bypass RLS)

Para ejecutarlos:
```bash
node test-orders-diagnosis.js
node test-orders-service-role.js
```

---

## 📞 Próximos Pasos

1. ✅ Aplicar las políticas RLS en Supabase
2. ✅ Refrescar el backoffice
3. ✅ Verificar que la orden ORD-20251209-000011 aparece
4. 🔄 Si tienes más órdenes, deberían aparecer automáticamente

¿Necesitas ayuda para aplicar estas políticas o tienes alguna otra pregunta?
