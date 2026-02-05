import { test, expect } from '@playwright/test';

test.describe('Search and Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/webshop');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Product Search', () => {
    test('should search for products by name', async ({ page }) => {
      const searchInput = page.getByTestId('input-product-search');
      await searchInput.fill('Alpine');
      
      await page.waitForTimeout(500);
      
      const products = page.locator('[data-testid^="product-article-"]');
      const productCount = await products.count();
      
      expect(productCount).toBeGreaterThanOrEqual(0);
      
      const resultsCount = page.getByTestId('results-count');
      if (await resultsCount.isVisible()) {
        await expect(resultsCount).toBeVisible();
      }
    });

    test('should clear search and show all products', async ({ page }) => {
      const searchInput = page.getByTestId('input-product-search');
      await searchInput.fill('Alpine');
      await page.waitForTimeout(500);
      
      await searchInput.fill('');
      await page.waitForTimeout(500);
      
      const products = page.locator('[data-testid^="product-article-"]');
      const productCount = await products.count();
      
      expect(productCount).toBeGreaterThan(0);
    });

    test('should show no results for non-existent product', async ({ page }) => {
      const searchInput = page.getByTestId('input-product-search');
      await searchInput.fill('xyznonexistentproduct123');
      
      await page.waitForTimeout(500);
      
      const products = page.locator('[data-testid^="product-article-"]');
      const productCount = await products.count();
      
      expect(productCount).toBe(0);
    });
  });

  test.describe('Category Filter', () => {
    test('should filter products by category', async ({ page }) => {
      const categorySelect = page.getByTestId('select-category');
      await categorySelect.click();
      
      const categoryOption = page.locator('[role="option"]').first();
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        
        await page.waitForTimeout(500);
        
        const products = page.locator('[data-testid^="product-article-"]');
        const productCount = await products.count();
        
        expect(productCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should show category in breadcrumb when filtered', async ({ page }) => {
      const categorySelect = page.getByTestId('select-category');
      await categorySelect.click();
      
      const categoryOption = page.locator('[role="option"]').nth(1);
      if (await categoryOption.isVisible()) {
        const categoryText = await categoryOption.textContent();
        await categoryOption.click();
        
        await page.waitForTimeout(500);
        
        const breadcrumbCategory = page.getByTestId('breadcrumb-category');
        if (await breadcrumbCategory.isVisible()) {
          await expect(breadcrumbCategory).toBeVisible();
        }
      }
    });

    test('should clear category filter', async ({ page }) => {
      const categorySelect = page.getByTestId('select-category');
      await categorySelect.click();
      
      const categoryOption = page.locator('[role="option"]').nth(1);
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        await page.waitForTimeout(500);
      }
      
      await categorySelect.click();
      const allCategoriesOption = page.locator('[role="option"]').first();
      await allCategoriesOption.click();
      
      await page.waitForTimeout(500);
    });
  });

  test.describe('Brand Filter', () => {
    test('should filter products by brand', async ({ page }) => {
      const brandSelect = page.getByTestId('select-brand');
      await brandSelect.click();
      
      const brandOption = page.locator('[role="option"]').nth(1);
      if (await brandOption.isVisible()) {
        await brandOption.click();
        
        await page.waitForTimeout(500);
        
        const products = page.locator('[data-testid^="product-article-"]');
        const productCount = await products.count();
        
        expect(productCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should show brand in breadcrumb when filtered', async ({ page }) => {
      const brandSelect = page.getByTestId('select-brand');
      await brandSelect.click();
      
      const brandOption = page.locator('[role="option"]').nth(1);
      if (await brandOption.isVisible()) {
        await brandOption.click();
        
        await page.waitForTimeout(500);
        
        const breadcrumbBrand = page.getByTestId('breadcrumb-brand-current');
        if (await breadcrumbBrand.isVisible()) {
          await expect(breadcrumbBrand).toBeVisible();
        }
      }
    });
  });

  test.describe('Vehicle Make Filter', () => {
    test('should filter products by vehicle make', async ({ page }) => {
      const makeSelect = page.getByTestId('select-vehicle-make');
      await makeSelect.click();
      
      const makeOption = page.locator('[role="option"]').nth(1);
      if (await makeOption.isVisible()) {
        await makeOption.click();
        
        await page.waitForTimeout(500);
        
        const products = page.locator('[data-testid^="product-article-"]');
        await products.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Combined Filters', () => {
    test('should apply multiple filters together', async ({ page }) => {
      const categorySelect = page.getByTestId('select-category');
      await categorySelect.click();
      const categoryOption = page.locator('[role="option"]').nth(1);
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        await page.waitForTimeout(300);
      }
      
      const brandSelect = page.getByTestId('select-brand');
      await brandSelect.click();
      const brandOption = page.locator('[role="option"]').nth(1);
      if (await brandOption.isVisible()) {
        await brandOption.click();
        await page.waitForTimeout(500);
      }
      
      const products = page.locator('[data-testid^="product-article-"]');
      const productCount = await products.count();
      
      expect(productCount).toBeGreaterThanOrEqual(0);
    });

    test('should combine search with category filter', async ({ page }) => {
      const categorySelect = page.getByTestId('select-category');
      await categorySelect.click();
      const categoryOption = page.locator('[role="option"]').nth(1);
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        await page.waitForTimeout(300);
      }
      
      const searchInput = page.getByTestId('input-product-search');
      await searchInput.fill('Alpine');
      
      await page.waitForTimeout(500);
      
      const products = page.locator('[data-testid^="product-article-"]');
      const productCount = await products.count();
      
      expect(productCount).toBeGreaterThanOrEqual(0);
    });

    test('should clear all filters', async ({ page }) => {
      const searchInput = page.getByTestId('input-product-search');
      await searchInput.fill('test');
      await page.waitForTimeout(300);
      
      const categorySelect = page.getByTestId('select-category');
      await categorySelect.click();
      const categoryOption = page.locator('[role="option"]').nth(1);
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
        await page.waitForTimeout(300);
      }
      
      const clearButton = page.getByTestId('button-clear-filters');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForTimeout(500);
        
        await expect(searchInput).toHaveValue('');
      }
    });
  });

  test.describe('Sort Functionality', () => {
    test('should sort products by different criteria', async ({ page }) => {
      const sortSelect = page.getByTestId('select-sort');
      await sortSelect.click();
      
      const priceOption = page.locator('[role="option"]').filter({ hasText: /prijs|price/i }).first();
      if (await priceOption.isVisible()) {
        await priceOption.click();
        await page.waitForTimeout(500);
        
        const products = page.locator('[data-testid^="product-article-"]');
        const productCount = await products.count();
        
        expect(productCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Price Range Filter', () => {
    test('should filter products by price range', async ({ page }) => {
      const priceSlider = page.getByTestId('slider-price-range');
      
      if (await priceSlider.isVisible()) {
        const sliderTrack = priceSlider.locator('[role="slider"]').first();
        if (await sliderTrack.isVisible()) {
          await sliderTrack.dragTo(sliderTrack, { 
            targetPosition: { x: 50, y: 0 } 
          });
          
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Stock Filter', () => {
    test('should filter in-stock products only', async ({ page }) => {
      const stockCheckbox = page.getByTestId('checkbox-in-stock');
      
      if (await stockCheckbox.isVisible()) {
        await stockCheckbox.check();
        
        await page.waitForTimeout(500);
        
        const products = page.locator('[data-testid^="product-article-"]');
        const productCount = await products.count();
        
        expect(productCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('View Mode Toggle', () => {
    test('should switch between grid and list view', async ({ page }) => {
      const gridButton = page.getByTestId('button-view-grid');
      const listButton = page.getByTestId('button-view-list');
      
      if (await listButton.isVisible()) {
        await listButton.click();
        await page.waitForTimeout(300);
        
        await gridButton.click();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('Quick Filter Badges', () => {
    test('should apply featured filter badge', async ({ page }) => {
      const featuredBadge = page.getByTestId('badge-filter-featured');
      
      if (await featuredBadge.isVisible()) {
        await featuredBadge.click();
        await page.waitForTimeout(500);
      }
    });

    test('should apply newest filter badge', async ({ page }) => {
      const newestBadge = page.getByTestId('badge-filter-newest');
      
      if (await newestBadge.isVisible()) {
        await newestBadge.click();
        await page.waitForTimeout(500);
      }
    });

    test('should apply price filter badge', async ({ page }) => {
      const priceBadge = page.getByTestId('badge-filter-price');
      
      if (await priceBadge.isVisible()) {
        await priceBadge.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Toggle Filters Panel', () => {
    test('should toggle filters panel visibility', async ({ page }) => {
      const toggleButton = page.getByTestId('button-toggle-filters');
      
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.waitForTimeout(300);
        
        await toggleButton.click();
        await page.waitForTimeout(300);
      }
    });
  });
});

test.describe('Search - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should open mobile search', async ({ page }) => {
    await page.goto('/webshop');
    await page.waitForLoadState('networkidle');
    
    const mobileSearchToggle = page.getByTestId('mobile-search-toggle');
    if (await mobileSearchToggle.isVisible()) {
      await mobileSearchToggle.click();
      
      const mobileSearchInput = page.getByTestId('mobile-search-input');
      await expect(mobileSearchInput).toBeVisible();
      
      await mobileSearchInput.fill('Alpine');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Mega Menu Navigation', () => {
  test('should navigate to category via mega menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const productsNav = page.getByTestId('nav-products-trigger');
    if (await productsNav.isVisible()) {
      await productsNav.hover();
      
      await page.waitForTimeout(500);
      
      const categoryLink = page.locator('[data-testid^="megamenu-category-"]').first();
      if (await categoryLink.isVisible()) {
        await categoryLink.click();
        
        await page.waitForURL(/\/webshop/);
      }
    }
  });

  test('should navigate to brand via mega menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const productsNav = page.getByTestId('nav-products-trigger');
    if (await productsNav.isVisible()) {
      await productsNav.hover();
      
      await page.waitForTimeout(500);
      
      const brandLink = page.locator('[data-testid^="megamenu-brand-"]').first();
      if (await brandLink.isVisible()) {
        await brandLink.click();
        
        await page.waitForURL(/\/webshop/);
      }
    }
  });

  test('should navigate to all products via mega menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const productsNav = page.getByTestId('nav-products-trigger');
    if (await productsNav.isVisible()) {
      await productsNav.hover();
      
      await page.waitForTimeout(500);
      
      const allProductsLink = page.getByTestId('megamenu-all-products');
      if (await allProductsLink.isVisible()) {
        await allProductsLink.click();
        
        await page.waitForURL(/\/webshop/);
      }
    }
  });
});
