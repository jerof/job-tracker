import { test, expect } from '@playwright/test';

test.describe('Credits System', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assumes user is logged in via test fixtures)
    await page.goto('/');
    // Wait for the sidenav to be visible (indicates page is loaded)
    await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });
  });

  test.describe('Credit Balance Display', () => {

    test('displays credit balance in sidebar with healthy credits', async ({ page }) => {
      // Mock API to return healthy credit balance
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 25,
            totalPurchased: 30,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      // Reload to trigger the mocked API
      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Look for CreditBalance component - should show credits remaining
      const creditDisplay = page.locator('[data-testid="credit-balance"]');
      await expect(creditDisplay).toBeVisible({ timeout: 5000 });

      // Verify it shows the number
      await expect(creditDisplay).toContainText('25');
      await expect(creditDisplay).toContainText('credits remaining');
    });

    test('displays singular "credit" when only 1 credit remaining', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 1,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      const creditDisplay = page.locator('[data-testid="credit-balance"]');
      await expect(creditDisplay).toBeVisible({ timeout: 5000 });
      await expect(creditDisplay).toContainText('1 credit remaining');
    });

    test('credit balance shows green color for healthy credits (>= 3)', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 10,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      const creditDisplay = page.locator('[data-testid="credit-balance"]');
      await expect(creditDisplay).toBeVisible({ timeout: 5000 });

      // Check for emerald/green background class
      const balanceWrapper = page.locator('[data-testid="credit-balance-wrapper"]');
      await expect(balanceWrapper).toHaveClass(/bg-emerald/);
    });

    test('credit balance shows amber color for low credits (1-2)', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 2,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      const balanceWrapper = page.locator('[data-testid="credit-balance-wrapper"]');
      await expect(balanceWrapper).toBeVisible({ timeout: 5000 });
      await expect(balanceWrapper).toHaveClass(/bg-amber/);
    });

    test('credit balance shows red color for zero credits', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 0,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      const balanceWrapper = page.locator('[data-testid="credit-balance-wrapper"]');
      await expect(balanceWrapper).toBeVisible({ timeout: 5000 });
      await expect(balanceWrapper).toHaveClass(/bg-red/);
    });

    test('displays "Buy more credits" button in sidebar', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      const buyButton = page.locator('[data-testid="buy-credits-button"]');
      await expect(buyButton).toBeVisible({ timeout: 5000 });
      await expect(buyButton).toContainText('Buy more credits');
    });
  });

  test.describe('Low Credits Warning', () => {

    test('shows low credits warning when credits <= 3', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 3,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Check for LowCreditsWarning banner
      const warning = page.locator('[data-testid="low-credits-warning"]');
      await expect(warning).toBeVisible({ timeout: 5000 });
      await expect(warning).toContainText('Running low on credits');
    });

    test('shows urgent warning when credits = 0', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 0,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      const warning = page.locator('[data-testid="low-credits-warning"]');
      await expect(warning).toBeVisible({ timeout: 5000 });
      await expect(warning).toContainText("You're out of credits");
    });

    test('shows "Only 1 credit left!" message when credits = 1', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 1,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      const warning = page.locator('[data-testid="low-credits-warning"]');
      await expect(warning).toBeVisible({ timeout: 5000 });
      await expect(warning).toContainText('Only 1 credit left');
    });

    test('does not show warning when credits > 3', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 10,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });
      await page.waitForTimeout(500); // Wait for potential warning to appear

      const warning = page.locator('[data-testid="low-credits-warning"]');
      await expect(warning).not.toBeVisible();
    });

    test('warning has Buy Credits button', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 2,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      const warning = page.locator('[data-testid="low-credits-warning"]');
      await expect(warning).toBeVisible({ timeout: 5000 });

      const buyButton = warning.locator('button');
      await expect(buyButton).toBeVisible();
      await expect(buyButton).toContainText('Buy Credits');
    });
  });

  test.describe('Buy Credits Modal', () => {

    test('opens buy credits modal when clicking buy button in sidebar', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Click the buy button
      const buyButton = page.locator('[data-testid="buy-credits-button"]');
      await expect(buyButton).toBeVisible({ timeout: 5000 });
      await buyButton.click();

      // Verify modal opens
      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });
      await expect(modal).toContainText('Buy Credits');
    });

    test('shows all 3 bundle options in modal', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Open modal
      const buyButton = page.locator('[data-testid="buy-credits-button"]');
      await buyButton.click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Check all 3 bundles are visible
      await expect(modal.getByText('Starter')).toBeVisible();
      await expect(modal.getByText('Job Seeker')).toBeVisible();
      await expect(modal.getByText('Power Search')).toBeVisible();
    });

    test('displays correct pricing for Starter bundle ($9 for 10 credits)', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Open modal
      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Find the Starter bundle card
      const starterCard = page.locator('[data-testid="bundle-starter"]');
      await expect(starterCard).toBeVisible();
      await expect(starterCard).toContainText('10');
      await expect(starterCard).toContainText('credits');
      await expect(starterCard).toContainText('$9');
    });

    test('displays correct pricing for Job Seeker bundle ($19 for 30 credits)', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      const jobSeekerCard = page.locator('[data-testid="bundle-job_seeker"]');
      await expect(jobSeekerCard).toBeVisible();
      await expect(jobSeekerCard).toContainText('30');
      await expect(jobSeekerCard).toContainText('credits');
      await expect(jobSeekerCard).toContainText('$19');
    });

    test('displays correct pricing for Power Search bundle ($39 for 100 credits)', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      const powerSearchCard = page.locator('[data-testid="bundle-power_search"]');
      await expect(powerSearchCard).toBeVisible();
      await expect(powerSearchCard).toContainText('100');
      await expect(powerSearchCard).toContainText('credits');
      await expect(powerSearchCard).toContainText('$39');
    });

    test('shows POPULAR badge on Job Seeker bundle', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Check for POPULAR badge
      await expect(modal.getByText('POPULAR')).toBeVisible();

      // Verify it's on Job Seeker card
      const jobSeekerCard = page.locator('[data-testid="bundle-job_seeker"]');
      await expect(jobSeekerCard.getByText('POPULAR')).toBeVisible();
    });

    test('shows savings badges on discounted bundles', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Job Seeker should show 30% off
      const jobSeekerCard = page.locator('[data-testid="bundle-job_seeker"]');
      await expect(jobSeekerCard.getByText('30% off')).toBeVisible();

      // Power Search should show 57% off
      const powerSearchCard = page.locator('[data-testid="bundle-power_search"]');
      await expect(powerSearchCard.getByText('57% off')).toBeVisible();
    });

    test('shows current balance in modal header', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 7,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Check for current balance display
      await expect(modal.getByText('Current balance:')).toBeVisible();
      await expect(modal.getByText('7 credits')).toBeVisible();
    });

    test('closes modal when clicking close button', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Open modal
      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Click close button
      const closeButton = page.locator('[data-testid="modal-close-button"]');
      await closeButton.click();

      // Verify modal is hidden
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('closes modal when clicking backdrop', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Open modal
      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Click on the backdrop (outside the modal content)
      const backdrop = page.locator('[data-testid="modal-backdrop"]');
      await backdrop.click({ position: { x: 10, y: 10 } });

      // Verify modal is hidden
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('closes modal when pressing Escape key', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Open modal
      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Press Escape
      await page.keyboard.press('Escape');

      // Verify modal is hidden
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('each bundle has a Buy Now button', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Each bundle should have a Buy Now button
      const buyButtons = modal.getByRole('button', { name: 'Buy Now' });
      await expect(buyButtons).toHaveCount(3);
    });

    test('shows secure payment note', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 5,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      await page.locator('[data-testid="buy-credits-button"]').click();

      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Check for footer note
      await expect(modal.getByText('Secure payment via Stripe')).toBeVisible();
      await expect(modal.getByText('Credits never expire')).toBeVisible();
    });
  });

  test.describe('Modal from Warning Banner', () => {

    test('opens modal when clicking Buy Credits in warning banner', async ({ page }) => {
      await page.route('**/api/credits', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            credits: 1,
            totalPurchased: 10,
            lastFreeReset: new Date().toISOString(),
          }),
        });
      });

      await page.reload();
      await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

      // Find and click the Buy Credits button in the warning banner
      const warning = page.locator('[data-testid="low-credits-warning"]');
      await expect(warning).toBeVisible({ timeout: 5000 });

      const buyInWarning = warning.getByRole('button', { name: /Buy Credits/i });
      await buyInWarning.click();

      // Verify modal opens
      const modal = page.locator('[data-testid="buy-credits-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });
    });
  });
});
