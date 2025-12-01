import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/admin/dashboard', title: 'Dashboard' },
  { path: '/admin/crm/customers', title: 'Clientes' },
  { path: '/admin/orders', title: 'Pedidos' },
  { path: '/admin/products', title: 'Productos' },
  { path: '/admin/retail', title: 'Tiendas' },
  { path: '/admin/events', title: 'Eventos' },
  { path: '/admin/gamification', title: 'Gamificación' },
  { path: '/admin/marketing/campaigns', title: 'Campañas' },
  { path: '/admin/settings', title: 'Configuración' },
];

test.describe('Smoke Tests - Admin Pages', () => {
  for (const pageInfo of PAGES) {
    test(`should load ${pageInfo.title} page`, async ({ page }) => {
      await page.goto(pageInfo.path);
      
      // Verify URL
      await expect(page).toHaveURL(new RegExp(pageInfo.path));
      
      // Check for main content visibility (generic check for the title or main container)
      // Most pages have an h1 with the title
      await expect(page.locator('h1')).toBeVisible();
      
      // Optional: Check for no error toasts
      await expect(page.locator('.toast-error')).not.toBeVisible();
    });
  }
});

test.describe('Feature Specific Tests', () => {
  test('Dashboard loads stats', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Check for KPI cards
    await expect(page.getByText('Ventas Totales')).toBeVisible();
    await expect(page.getByText('Pedidos Activos')).toBeVisible();
  });

  test('Products list loads items', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page.getByText('Inventario')).toBeVisible();
    // Assuming there's a table
    await expect(page.locator('table')).toBeVisible();
  });

  test('CRM Customer list loads', async ({ page }) => {
    await page.goto('/admin/crm/customers');
    await expect(page.locator('table')).toBeVisible();
  });
});
