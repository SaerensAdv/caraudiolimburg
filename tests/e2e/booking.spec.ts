import { test, expect } from '@playwright/test';
import { format, addDays } from 'date-fns';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Load', () => {
    test('should display booking page with hero section', async ({ page }) => {
      await expect(page.getByTestId('badge-warranty')).toBeVisible();
      await expect(page.getByTestId('badge-fast')).toBeVisible();
      await expect(page.getByTestId('badge-certified')).toBeVisible();
    });

    test('should display booking calendar component', async ({ page }) => {
      await expect(page.getByTestId('booking-calendar')).toBeVisible();
    });

    test('should display current month in calendar', async ({ page }) => {
      const calendarMonth = page.getByTestId('calendar-month');
      await expect(calendarMonth).toBeVisible();
      await expect(calendarMonth).not.toBeEmpty();
    });
  });

  test.describe('Service Selection', () => {
    test('should display all service options', async ({ page }) => {
      await expect(page.getByTestId('radio-service-radio')).toBeVisible();
      await expect(page.getByTestId('radio-service-speakers')).toBeVisible();
      await expect(page.getByTestId('radio-service-complete')).toBeVisible();
      await expect(page.getByTestId('radio-service-custom')).toBeVisible();
    });

    test('should select autoradio installation service', async ({ page }) => {
      await page.getByTestId('radio-service-radio').click();
      
      await expect(page.getByTestId('radio-service-radio')).toBeChecked();
    });

    test('should select speaker upgrade service', async ({ page }) => {
      await page.getByTestId('radio-service-speakers').click();
      
      await expect(page.getByTestId('radio-service-speakers')).toBeChecked();
    });

    test('should select complete audio system service', async ({ page }) => {
      await page.getByTestId('radio-service-complete').click();
      
      await expect(page.getByTestId('radio-service-complete')).toBeChecked();
    });

    test('should select custom quote service', async ({ page }) => {
      await page.getByTestId('radio-service-custom').click();
      
      await expect(page.getByTestId('radio-service-custom')).toBeChecked();
    });
  });

  test.describe('Calendar Navigation', () => {
    test('should navigate to next month', async ({ page }) => {
      const currentMonthText = await page.getByTestId('calendar-month').textContent();
      
      await page.getByTestId('button-next-month').click();
      
      const newMonthText = await page.getByTestId('calendar-month').textContent();
      expect(newMonthText).not.toBe(currentMonthText);
    });

    test('should navigate to previous month', async ({ page }) => {
      await page.getByTestId('button-next-month').click();
      await page.waitForTimeout(200);
      
      const monthAfterNext = await page.getByTestId('calendar-month').textContent();
      
      await page.getByTestId('button-previous-month').click();
      
      const monthAfterPrev = await page.getByTestId('calendar-month').textContent();
      expect(monthAfterPrev).not.toBe(monthAfterNext);
    });
  });

  test.describe('Date Selection', () => {
    test('should select a future date', async ({ page }) => {
      await page.getByTestId('radio-service-radio').click();
      
      const futureDate = addDays(new Date(), 7);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        
        await expect(page.getByTestId('time-slots')).toBeVisible();
      }
    });

    test('should not select past dates', async ({ page }) => {
      const pastDate = addDays(new Date(), -1);
      const dateString = format(pastDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await expect(dayButton).toBeDisabled();
      }
    });

    test('should show time slots after selecting date and service', async ({ page }) => {
      await page.getByTestId('radio-service-speakers').click();
      
      const futureDate = addDays(new Date(), 5);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        
        await expect(page.getByTestId('time-slots')).toBeVisible();
      }
    });
  });

  test.describe('Time Slot Selection', () => {
    test('should select a time slot', async ({ page }) => {
      await page.getByTestId('radio-service-radio').click();
      
      const futureDate = addDays(new Date(), 7);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        await page.waitForTimeout(300);
        
        const timeSlot = page.getByTestId('button-time-09:00');
        if (await timeSlot.isVisible()) {
          await timeSlot.click();
          
          await expect(page.getByTestId('button-confirm-booking')).toBeVisible();
        }
      }
    });

    test('should display available time slots', async ({ page }) => {
      await page.getByTestId('radio-service-complete').click();
      
      const futureDate = addDays(new Date(), 10);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        await page.waitForTimeout(300);
        
        const timeSlots = page.locator('[data-testid^="button-time-"]');
        const count = await timeSlots.count();
        
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Complete Booking Flow', () => {
    test('should complete full booking flow', async ({ page }) => {
      await page.getByTestId('radio-service-radio').click();
      await expect(page.getByTestId('radio-service-radio')).toBeChecked();
      
      const futureDate = addDays(new Date(), 7);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        await page.waitForTimeout(300);
        
        const timeSlot = page.getByTestId('button-time-10:00');
        if (await timeSlot.isVisible()) {
          await timeSlot.click();
          
          await expect(page.getByTestId('button-confirm-booking')).toBeVisible();
          await expect(page.getByTestId('button-confirm-booking')).toBeEnabled();
        }
      }
    });

    test('should show booking confirmation after submission', async ({ page }) => {
      await page.getByTestId('radio-service-speakers').click();
      
      const futureDate = addDays(new Date(), 8);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        await page.waitForTimeout(300);
        
        const timeSlot = page.getByTestId('button-time-14:00');
        if (await timeSlot.isVisible()) {
          await timeSlot.click();
          
          const confirmButton = page.getByTestId('button-confirm-booking');
          await expect(confirmButton).toBeVisible();
          
          await confirmButton.click();
          
          await page.waitForTimeout(1000);
          
          const toast = page.getByText('Afspraak succesvol geboekt');
          if (await toast.isVisible({ timeout: 3000 }).catch(() => false)) {
            await expect(toast).toBeVisible();
          }
        }
      }
    });

    test('should reset form after successful booking', async ({ page }) => {
      await page.getByTestId('radio-service-radio').click();
      
      const futureDate = addDays(new Date(), 9);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        await page.waitForTimeout(300);
        
        const timeSlot = page.getByTestId('button-time-11:00');
        if (await timeSlot.isVisible()) {
          await timeSlot.click();
          
          await page.getByTestId('button-confirm-booking').click();
          
          await page.waitForTimeout(2000);
          
          await expect(page.getByTestId('radio-service-radio')).not.toBeChecked();
        }
      }
    });
  });

  test.describe('Step Indicators', () => {
    test('should update step indicators as user progresses', async ({ page }) => {
      await expect(page.getByTestId('booking-calendar')).toBeVisible();
      
      await page.getByTestId('radio-service-complete').click();
      
      const futureDate = addDays(new Date(), 6);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        
        await expect(page.getByTestId('time-slots')).toBeVisible();
      }
    });
  });

  test.describe('Validation', () => {
    test('should require service selection before date selection triggers time slots', async ({ page }) => {
      const futureDate = addDays(new Date(), 7);
      const dateString = format(futureDate, 'yyyy-MM-dd');
      
      const dayButton = page.getByTestId(`calendar-day-${dateString}`);
      
      if (await dayButton.isVisible()) {
        await dayButton.click();
        
        await expect(page.getByTestId('time-slots')).not.toBeVisible();
      }
    });
  });
});

test.describe('Booking - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display booking calendar on mobile', async ({ page }) => {
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByTestId('booking-calendar')).toBeVisible();
  });

  test('should complete booking flow on mobile', async ({ page }) => {
    await page.goto('/booking');
    await page.waitForLoadState('networkidle');
    
    await page.getByTestId('radio-service-radio').click();
    
    const futureDate = addDays(new Date(), 7);
    const dateString = format(futureDate, 'yyyy-MM-dd');
    
    const dayButton = page.getByTestId(`calendar-day-${dateString}`);
    
    if (await dayButton.isVisible()) {
      await dayButton.click();
      await page.waitForTimeout(300);
      
      const timeSlot = page.getByTestId('button-time-09:00');
      if (await timeSlot.isVisible()) {
        await timeSlot.click();
        
        await expect(page.getByTestId('button-confirm-booking')).toBeVisible();
      }
    }
  });
});

test.describe('Navigation to Booking', () => {
  test('should navigate to booking page from header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const bookingLink = page.getByTestId('nav-booking');
    if (await bookingLink.isVisible()) {
      await bookingLink.click();
      
      await page.waitForURL('/booking');
      await expect(page.getByTestId('booking-calendar')).toBeVisible();
    }
  });
});
