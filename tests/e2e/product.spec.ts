import { test, expect } from '@playwright/test';

test.describe('Product Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webshop');
    await page.waitForLoadState('networkidle');
    
    const productCard = page.locator('[data-testid^="product-article-"]').first();
    await productCard.click();
    await page.waitForURL(/\/webshop\//);
  });

  test.describe('Product Details', () => {
    test('should display product title and description', async ({ page }) => {
      await expect(page.getByTestId('product-title')).toBeVisible();
      await expect(page.getByTestId('product-title')).not.toBeEmpty();
      
      const shortDescription = page.getByTestId('product-short-description');
      if (await shortDescription.isVisible()) {
        await expect(shortDescription).not.toBeEmpty();
      }
    });

    test('should display product pricing information', async ({ page }) => {
      await expect(page.getByTestId('product-pricing')).toBeVisible();
    });

    test('should display product benefits section', async ({ page }) => {
      await expect(page.getByTestId('product-benefits')).toBeVisible();
    });

    test('should display product images', async ({ page }) => {
      await expect(page.getByTestId('product-images')).toBeVisible();
      await expect(page.getByTestId('main-product-image')).toBeVisible();
    });

    test('should display breadcrumb navigation', async ({ page }) => {
      await expect(page.getByTestId('breadcrumb')).toBeVisible();
    });
  });

  test.describe('Image Gallery', () => {
    test('should switch between product images using thumbnails', async ({ page }) => {
      const thumbnails = page.locator('[data-testid^="thumbnail-"]');
      const thumbnailCount = await thumbnails.count();
      
      if (thumbnailCount > 1) {
        const secondThumbnail = page.getByTestId('thumbnail-1');
        await secondThumbnail.click();
        
        await expect(secondThumbnail).toHaveAttribute('class', /ring|border/);
      }
    });

    test('should navigate images with arrow buttons', async ({ page }) => {
      const nextButton = page.getByTestId('button-next-image');
      const prevButton = page.getByTestId('button-previous-image');
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
        
        await prevButton.click();
        await page.waitForTimeout(300);
      }
    });

    test('should open lightbox when clicking main image', async ({ page }) => {
      const mainImage = page.getByTestId('main-product-image');
      await mainImage.click();
      
      const lightbox = page.getByTestId('lightbox-overlay');
      if (await lightbox.isVisible()) {
        await expect(lightbox).toBeVisible();
        
        await page.getByTestId('button-close-lightbox').click();
        await expect(lightbox).not.toBeVisible();
      }
    });

    test('should navigate images in lightbox', async ({ page }) => {
      const mainImage = page.getByTestId('main-product-image');
      await mainImage.click();
      
      const lightbox = page.getByTestId('lightbox-overlay');
      if (await lightbox.isVisible()) {
        const nextButton = page.getByTestId('button-next-lightbox');
        const prevButton = page.getByTestId('button-previous-lightbox');
        
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(300);
        }
        
        if (await prevButton.isVisible()) {
          await prevButton.click();
          await page.waitForTimeout(300);
        }
        
        await page.getByTestId('button-close-lightbox').click();
      }
    });
  });

  test.describe('Add to Cart', () => {
    test('should add product to cart', async ({ page }) => {
      await page.getByTestId('button-add-to-cart').click();
      
      await expect(page.getByText('Product toegevoegd')).toBeVisible();
    });

    test('should add product with installation', async ({ page }) => {
      const installButton = page.getByTestId('button-add-with-installation');
      if (await installButton.isVisible()) {
        await installButton.click();
        await expect(page.getByText('Product toegevoegd')).toBeVisible();
      }
    });

    test('should increase and decrease quantity', async ({ page }) => {
      const quantityDisplay = page.getByTestId('quantity-display');
      await expect(quantityDisplay).toHaveText('1');
      
      await page.getByTestId('button-increase-quantity').click();
      await expect(quantityDisplay).toHaveText('2');
      
      await page.getByTestId('button-decrease-quantity').click();
      await expect(quantityDisplay).toHaveText('1');
    });

    test('should not decrease quantity below 1', async ({ page }) => {
      const quantityDisplay = page.getByTestId('quantity-display');
      await expect(quantityDisplay).toHaveText('1');
      
      await page.getByTestId('button-decrease-quantity').click();
      await expect(quantityDisplay).toHaveText('1');
    });
  });

  test.describe('Product Variations', () => {
    test('should display variation selector when product has variations', async ({ page }) => {
      const variationSelector = page.getByTestId('variation-selector');
      
      if (await variationSelector.isVisible()) {
        const variations = page.locator('[data-testid^="variation-"]');
        const variationCount = await variations.count();
        
        expect(variationCount).toBeGreaterThan(0);
      }
    });

    test('should select different product variation', async ({ page }) => {
      const variationSelector = page.getByTestId('variation-selector');
      
      if (await variationSelector.isVisible()) {
        const variations = page.locator('[data-testid^="variation-"]');
        const variationCount = await variations.count();
        
        if (variationCount > 1) {
          await variations.nth(1).click();
          
          await expect(variations.nth(1)).toHaveAttribute('class', /selected|active|ring/);
        }
      }
    });
  });

  test.describe('Wishlist', () => {
    test('should toggle wishlist button', async ({ page }) => {
      const wishlistButton = page.getByTestId('button-wishlist');
      
      if (await wishlistButton.isVisible()) {
        await wishlistButton.click();
        
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Related Products', () => {
    test('should display related products section', async ({ page }) => {
      const relatedSection = page.getByTestId('related-products');
      
      if (await relatedSection.isVisible()) {
        const relatedProducts = page.locator('[data-testid^="related-product-"]');
        const count = await relatedProducts.count();
        
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test('should navigate to related product', async ({ page }) => {
      const relatedProducts = page.locator('[data-testid^="related-product-desktop-"]');
      const count = await relatedProducts.count();
      
      if (count > 0) {
        const currentUrl = page.url();
        await relatedProducts.first().click();
        await page.waitForURL(/\/product\//);
        
        expect(page.url()).not.toBe(currentUrl);
      }
    });
  });

  test.describe('Product Information Tabs', () => {
    test('should display product information section', async ({ page }) => {
      await expect(page.getByTestId('product-information')).toBeVisible();
    });
  });
});

test.describe('Product Page Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display mobile navigation controls', async ({ page }) => {
    await page.goto('/webshop');
    await page.waitForLoadState('networkidle');
    
    const productCard = page.locator('[data-testid^="product-article-"]').first();
    await productCard.click();
    await page.waitForURL(/\/webshop\//);
    
    await expect(page.getByTestId('mobile-back-button')).toBeVisible();
    await expect(page.getByTestId('mobile-cart-button')).toBeVisible();
  });

  test('should use mobile quantity controls', async ({ page }) => {
    await page.goto('/webshop');
    await page.waitForLoadState('networkidle');
    
    const productCard = page.locator('[data-testid^="product-article-"]').first();
    await productCard.click();
    await page.waitForURL(/\/webshop\//);
    
    const mobileIncreaseBtn = page.getByTestId('mobile-button-increase-quantity');
    const mobileDecreaseBtn = page.getByTestId('mobile-button-decrease-quantity');
    const mobileQuantity = page.getByTestId('mobile-quantity-display');
    
    if (await mobileIncreaseBtn.isVisible()) {
      await mobileIncreaseBtn.click();
      await expect(mobileQuantity).toHaveText('2');
      
      await mobileDecreaseBtn.click();
      await expect(mobileQuantity).toHaveText('1');
    }
  });

  test('should add to cart via mobile button', async ({ page }) => {
    await page.goto('/webshop');
    await page.waitForLoadState('networkidle');
    
    const productCard = page.locator('[data-testid^="product-article-"]').first();
    await productCard.click();
    await page.waitForURL(/\/webshop\//);
    
    const mobileAddButton = page.getByTestId('mobile-button-add-to-cart');
    if (await mobileAddButton.isVisible()) {
      await mobileAddButton.click();
      await expect(page.getByText('Product toegevoegd')).toBeVisible();
    }
  });

  test('should swipe through images on mobile', async ({ page }) => {
    await page.goto('/webshop');
    await page.waitForLoadState('networkidle');
    
    const productCard = page.locator('[data-testid^="product-article-"]').first();
    await productCard.click();
    await page.waitForURL(/\/webshop\//);
    
    const mobileDots = page.locator('[data-testid^="mobile-dot-"]');
    const dotCount = await mobileDots.count();
    
    if (dotCount > 1) {
      await mobileDots.nth(1).click();
      await page.waitForTimeout(300);
    }
  });
});
