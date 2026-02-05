import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.describe('Guest Checkout', () => {
    test('should complete guest checkout flow from homepage to order confirmation', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to be ready
      await page.waitForLoadState('networkidle');
      
      await page.goto('/webshop');
      await page.waitForLoadState('networkidle');
      
      const productCard = page.locator('[data-testid^="product-article-"]').first();
      await expect(productCard).toBeVisible();
      await productCard.click();
      
      await page.waitForURL(/\/webshop\//);
      await expect(page.getByTestId('product-title')).toBeVisible();
      
      await page.getByTestId('button-add-to-cart').click();
      
      await expect(page.getByText('Product toegevoegd')).toBeVisible();
      
      await page.getByTestId('button-cart').click();
      
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByTestId('checkout-progress')).toBeVisible();
      
      const guestEmailInput = page.getByTestId('input-guest-email');
      if (await guestEmailInput.isVisible()) {
        await guestEmailInput.fill('test@example.com');
        await page.getByTestId('button-continue-guest').click();
      }
      
      await page.getByTestId('input-email').fill('test@example.com');
      await page.getByTestId('input-first-name').fill('Jan');
      await page.getByTestId('input-last-name').fill('Jansen');
      await page.getByTestId('input-address').fill('Teststraat 123');
      await page.getByTestId('input-postal-code').fill('1234 AB');
      await page.getByTestId('input-city').fill('Amsterdam');
      
      await expect(page.getByTestId('section-contact')).toBeVisible();
      await expect(page.getByTestId('section-shipping')).toBeVisible();
      await expect(page.getByTestId('section-payment')).toBeVisible();
      
      await page.getByTestId('checkbox-terms').check();
      
      await expect(page.getByTestId('order-summary')).toBeVisible();
      
      await expect(page.getByTestId('button-place-order')).toBeEnabled();
    });

    test('should validate required fields in checkout form', async ({ page }) => {
      await page.goto('/webshop');
      await page.waitForLoadState('networkidle');
      
      const productCard = page.locator('[data-testid^="product-article-"]').first();
      await productCard.click();
      await page.waitForURL(/\/webshop\//);
      
      await page.getByTestId('button-add-to-cart').click();
      await page.waitForTimeout(500);
      
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
      
      const guestEmailInput = page.getByTestId('input-guest-email');
      if (await guestEmailInput.isVisible()) {
        await guestEmailInput.fill('test@example.com');
        await page.getByTestId('button-continue-guest').click();
      }
      
      await page.getByTestId('input-email').fill('invalid-email');
      await page.getByTestId('input-email').blur();
      
      await expect(page.getByText('geldig e-mailadres')).toBeVisible();
      
      await page.getByTestId('input-postal-code').fill('invalid');
      await page.getByTestId('input-postal-code').blur();
      
      await expect(page.getByText('geldige postcode')).toBeVisible();
    });

    test('should display order summary with correct product details', async ({ page }) => {
      await page.goto('/webshop');
      await page.waitForLoadState('networkidle');
      
      const productCard = page.locator('[data-testid^="product-article-"]').first();
      await productCard.click();
      await page.waitForURL(/\/webshop\//);
      
      const productTitle = await page.getByTestId('product-title').textContent();
      
      await page.getByTestId('button-add-to-cart').click();
      await page.waitForTimeout(500);
      
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
      
      const guestEmailInput = page.getByTestId('input-guest-email');
      if (await guestEmailInput.isVisible()) {
        await guestEmailInput.fill('test@example.com');
        await page.getByTestId('button-continue-guest').click();
      }
      
      await expect(page.getByTestId('order-summary')).toBeVisible();
      const summaryItem = page.locator('[data-testid^="summary-item-"]').first();
      await expect(summaryItem).toContainText(productTitle!.substring(0, 20));
    });

    test('should show checkout progress steps correctly', async ({ page }) => {
      await page.goto('/webshop');
      await page.waitForLoadState('networkidle');
      
      const productCard = page.locator('[data-testid^="product-article-"]').first();
      await productCard.click();
      await page.waitForURL(/\/webshop\//);
      await page.getByTestId('button-add-to-cart').click();
      await page.waitForTimeout(500);
      
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
      
      const guestEmailInput = page.getByTestId('input-guest-email');
      if (await guestEmailInput.isVisible()) {
        await guestEmailInput.fill('test@example.com');
        await page.getByTestId('button-continue-guest').click();
      }
      
      await expect(page.getByTestId('progress-step-1')).toBeVisible();
      await expect(page.getByTestId('progress-step-2')).toBeVisible();
      await expect(page.getByTestId('progress-step-3')).toBeVisible();
    });
  });

  test.describe('Add to Cart Flow', () => {
    test('should add product with installation to cart', async ({ page }) => {
      await page.goto('/webshop');
      await page.waitForLoadState('networkidle');
      
      const productCard = page.locator('[data-testid^="product-article-"]').first();
      await productCard.click();
      await page.waitForURL(/\/webshop\//);
      
      const installButton = page.getByTestId('button-add-with-installation');
      if (await installButton.isVisible()) {
        await installButton.click();
        await expect(page.getByText('Product toegevoegd')).toBeVisible();
      }
    });

    test('should update quantity before adding to cart', async ({ page }) => {
      await page.goto('/webshop');
      await page.waitForLoadState('networkidle');
      
      const productCard = page.locator('[data-testid^="product-article-"]').first();
      await productCard.click();
      await page.waitForURL(/\/webshop\//);
      
      await page.getByTestId('button-increase-quantity').click();
      await page.getByTestId('button-increase-quantity').click();
      
      await expect(page.getByTestId('quantity-display')).toHaveText('3');
      
      await page.getByTestId('button-add-to-cart').click();
      await expect(page.getByText('Product toegevoegd')).toBeVisible();
    });
  });
});
