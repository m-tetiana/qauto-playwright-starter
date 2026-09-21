// spec: specs/add-car.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Guest adds a car', () => {
  test('Guest adds Audi TT with mileage 12000', async ({ page }) => {
    // Precondition: open baseURL and click Guest log in
    await page.goto('/');
    await page.getByRole('button', { name: 'Guest log in' }).click();
    await expect(page).toHaveURL(/\/panel\/garage/);

    // Sidebar link "Garage" is scoped via the sidebar nav (identified by its
    // "Log out" item) because the page also has a same-named "Garage" link
    // in the top header nav.
    const sidebarNav = page.locator('nav').filter({ hasText: 'Log out' });
    await expect(sidebarNav.getByRole('link', { name: 'Garage' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Garage', level: 1 })).toBeVisible();
    const addCarButton = page.getByRole('button', { name: 'Add car' });
    await expect(addCarButton).toBeVisible();

    // 1. Click Add car
    await addCarButton.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Add a car' })).toBeVisible();
    const brandSelect = dialog.getByLabel('Brand');
    const modelSelect = dialog.getByLabel('Model');
    const mileageInput = dialog.getByRole('spinbutton', { name: 'Mileage' });
    await expect(brandSelect).toBeVisible();
    await expect(modelSelect).toBeVisible();
    await expect(mileageInput).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    const addButton = dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeDisabled();

    // 2. Select Audi in Brand
    await brandSelect.selectOption('Audi');
    await expect(brandSelect.locator('option:checked')).toHaveText('Audi');

    // 3. Select TT in Model
    await modelSelect.selectOption('TT');
    await expect(modelSelect.locator('option:checked')).toHaveText('TT');

    // 4. Fill Mileage with 12000
    await mileageInput.fill('12000');
    await expect(mileageInput).toHaveValue('12000');
    await expect(addButton).toBeEnabled();

    // 5. Click Add
    await addButton.click();
    await expect(dialog).toBeHidden();

    const carCard = page.getByRole('listitem').filter({ hasText: 'Audi TT' });
    const carLogo = carCard.getByRole('img', { name: 'TT' });
    await expect(carLogo).toBeVisible();
    await expect(carLogo).toHaveAttribute('src', /audi\.png/);
    await expect(carCard.getByText('Audi TT')).toBeVisible();
    // Edit icon button has no accessible name (icon-only, class "car_edit");
    // scoped to the card since role/name locators are not available for it.
    await expect(carCard.locator('.car_edit')).toBeVisible();
    await expect(carCard.getByRole('button', { name: 'Add fuel expense' })).toBeVisible();
    await expect(carCard.getByRole('spinbutton')).toHaveValue('12000');
    await expect(carCard.getByRole('button', { name: 'Update' })).toBeDisabled();
  });
});
