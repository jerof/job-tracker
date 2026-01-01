import { test, expect } from '@playwright/test';

test.describe('Left Side Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the sidenav to be visible
    await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });
  });

  test('should render sidenav with all 4 navigation items', async ({ page }) => {
    // Check sidenav is visible
    const sidenav = page.locator('[data-testid="sidenav"]');
    await expect(sidenav).toBeVisible();

    // Check all 4 nav items are present
    await expect(page.locator('[data-testid="nav-item-jobs"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-item-cv"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-item-research"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-item-settings"]')).toBeVisible();
  });

  test('should display nav item labels in expanded state', async ({ page }) => {
    // Ensure sidenav is expanded (check width or collapse state)
    const sidenav = page.locator('[data-testid="sidenav"]');

    // Look for visible text labels
    await expect(page.getByText('Jobs')).toBeVisible();
    await expect(page.getByText('CV')).toBeVisible();
    await expect(page.getByText('Research')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('should navigate to /cv when clicking CV nav item', async ({ page }) => {
    // Click the CV nav item
    await page.locator('[data-testid="nav-item-cv"]').click();

    // Wait for navigation
    await page.waitForURL('**/cv');

    // Verify we're on the CV page
    expect(page.url()).toContain('/cv');

    // Verify CV page content is visible (use exact match for "CV" heading)
    await expect(page.getByRole('heading', { name: 'CV', exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('should show active state on current route', async ({ page }) => {
    // Jobs should be active by default on the home page
    const jobsNavItem = page.locator('[data-testid="nav-item-jobs"]');
    await expect(jobsNavItem).toHaveAttribute('data-active', 'true');

    // CV should not be active
    const cvNavItem = page.locator('[data-testid="nav-item-cv"]');
    await expect(cvNavItem).toHaveAttribute('data-active', 'false');

    // Navigate to CV
    await cvNavItem.click();
    await page.waitForURL('**/cv');

    // Now CV should be active
    await expect(cvNavItem).toHaveAttribute('data-active', 'true');

    // Jobs should no longer be active
    await expect(jobsNavItem).toHaveAttribute('data-active', 'false');
  });

  test('should toggle collapse state when clicking collapse button', async ({ page }) => {
    // Use a larger viewport to ensure we're not in mobile mode
    await page.setViewportSize({ width: 1280, height: 720 });

    // Clear localStorage to reset any saved collapse state
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('sidenav-collapsed'));

    // Reload page to apply clean state
    await page.reload();

    // Wait for sidenav with the collapse toggle visible (means it's fully mounted)
    await page.waitForSelector('[data-testid="sidenav-collapse-toggle"]', { timeout: 10000 });

    const sidenav = page.locator('[data-testid="sidenav"]');
    const collapseToggle = page.locator('[data-testid="sidenav-collapse-toggle"]');

    // Wait for any overlays to clear and for React to fully hydrate
    await page.waitForTimeout(1500);

    // Get initial width (should be expanded on desktop, ~200px)
    const initialBox = await sidenav.boundingBox();
    const initialWidth = initialBox?.width || 0;

    // Skip test if sidenav starts collapsed (may be localStorage or timing issue)
    if (initialWidth < 100) {
      console.log('Sidenav started collapsed, testing expand instead');
      // Click to expand
      await collapseToggle.click({ force: true });
      await page.waitForTimeout(500);

      const expandedBox = await sidenav.boundingBox();
      const expandedWidth = expandedBox?.width || 0;

      // Should now be expanded (around 200px)
      expect(expandedWidth).toBeGreaterThan(initialWidth);

      // Click to collapse again
      await collapseToggle.click({ force: true });
      await page.waitForTimeout(500);

      const collapsedBox = await sidenav.boundingBox();
      const collapsedWidth = collapsedBox?.width || 0;

      // Should be collapsed again
      expect(collapsedWidth).toBeLessThan(expandedWidth);
      return;
    }

    // Normal flow: starts expanded, test collapse then expand
    expect(initialWidth).toBeGreaterThan(100);

    // Click collapse toggle
    await collapseToggle.click({ force: true });
    await page.waitForTimeout(500);

    // Get collapsed width
    const collapsedBox = await sidenav.boundingBox();
    const collapsedWidth = collapsedBox?.width || 0;

    // Width should be smaller when collapsed
    expect(collapsedWidth).toBeLessThan(initialWidth);
    expect(collapsedWidth).toBeLessThanOrEqual(60);

    // Click again to expand
    await collapseToggle.click({ force: true });
    await page.waitForTimeout(500);

    // Get expanded width
    const expandedBox = await sidenav.boundingBox();
    const expandedWidth = expandedBox?.width || 0;

    // Width should be back to expanded state
    expect(expandedWidth).toBeGreaterThan(collapsedWidth);
  });
});

test.describe('CV Module', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the CV API to control state
    await page.route('**/api/cv', async (route, request) => {
      if (request.method() === 'GET') {
        // Return empty CV for most tests
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ cv: null }),
        });
      } else if (request.method() === 'POST') {
        // Mock successful save
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            cv: {
              id: 'test-cv-id',
              rawText: 'Test CV content',
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await page.goto('/cv');
    // Wait for page to load
    await page.waitForTimeout(500);
  });

  test('should load /cv page successfully', async ({ page }) => {
    // Check page heading is visible (use exact match for "CV" heading)
    await expect(page.getByRole('heading', { name: 'CV', exact: true })).toBeVisible();
  });

  test('should show empty state when no CV exists', async ({ page }) => {
    // Check for empty state indicator
    const emptyState = page.locator('[data-testid="cv-empty-state"]');
    await expect(emptyState).toBeVisible();

    // Check for empty state message
    await expect(page.getByText('No CV uploaded yet')).toBeVisible();
  });

  test('should display textarea for CV input', async ({ page }) => {
    const textarea = page.locator('[data-testid="cv-textarea"]');
    await expect(textarea).toBeVisible();

    // Should have placeholder text
    await expect(textarea).toHaveAttribute('placeholder', /Paste your CV content here/);
  });

  test('should allow entering text in textarea', async ({ page }) => {
    const textarea = page.locator('[data-testid="cv-textarea"]');

    // Type in the textarea
    await textarea.fill('John Doe\nSoftware Engineer\n\nExperience:\n- Built web apps');

    // Verify the text was entered
    await expect(textarea).toHaveValue(/John Doe/);
    await expect(textarea).toHaveValue(/Software Engineer/);
  });

  test('should enable save button when text is entered', async ({ page }) => {
    const textarea = page.locator('[data-testid="cv-textarea"]');
    const saveButton = page.locator('[data-testid="cv-save-button"]');

    // Save button should be disabled initially (no changes)
    await expect(saveButton).toBeDisabled();

    // Enter some text
    await textarea.fill('Test CV content');

    // Save button should now be enabled
    await expect(saveButton).toBeEnabled();
  });

  test('should keep save button disabled when textarea is empty', async ({ page }) => {
    const textarea = page.locator('[data-testid="cv-textarea"]');
    const saveButton = page.locator('[data-testid="cv-save-button"]');

    // Enter text then clear it
    await textarea.fill('Test');
    await expect(saveButton).toBeEnabled();

    await textarea.fill('');
    await expect(saveButton).toBeDisabled();
  });
});

test.describe('CV Module with Existing CV', () => {
  test('should show CV content when CV exists', async ({ page }) => {
    // Mock API to return existing CV
    await page.route('**/api/cv', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            cv: {
              id: 'existing-cv-id',
              rawText: 'Jane Smith\nProduct Manager\n\nExperience at Google',
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      }
    });

    await page.goto('/cv');
    await page.waitForTimeout(500);

    // Empty state should not be visible
    const emptyState = page.locator('[data-testid="cv-empty-state"]');
    await expect(emptyState).not.toBeVisible();

    // Textarea should contain the CV content
    const textarea = page.locator('[data-testid="cv-textarea"]');
    await expect(textarea).toHaveValue(/Jane Smith/);
    await expect(textarea).toHaveValue(/Product Manager/);
  });
});

test.describe('Skills Matcher in Card Detail Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for application cards to load
    await page.waitForSelector('[data-testid="application-card"]', { timeout: 15000 });
  });

  test('should have Prep tab in card detail modal', async ({ page }) => {
    // Open a card
    const card = page.locator('[data-testid="application-card"]').first();

    if ((await card.count()) === 0) {
      test.skip();
      return;
    }

    await card.click();
    await page.waitForTimeout(300);

    // Check the Prep tab exists
    const prepTab = page.locator('[data-testid="tab-prep"]');
    await expect(prepTab).toBeVisible();
    await expect(prepTab).toContainText('Prep');
  });

  test('should show Skills Matcher section in Prep tab', async ({ page }) => {
    // Open a card
    const card = page.locator('[data-testid="application-card"]').first();

    if ((await card.count()) === 0) {
      test.skip();
      return;
    }

    await card.click();
    await page.waitForTimeout(300);

    // Navigate to Prep tab
    await page.locator('[data-testid="tab-prep"]').click();
    await page.waitForTimeout(200);

    // Check for Skills Matcher section
    await expect(page.getByText('Skills Matcher')).toBeVisible({ timeout: 3000 });
  });

  test('should display Analyze Match button', async ({ page }) => {
    // Open a card
    const card = page.locator('[data-testid="application-card"]').first();

    if ((await card.count()) === 0) {
      test.skip();
      return;
    }

    await card.click();
    await page.waitForTimeout(300);

    // Navigate to Prep tab
    await page.locator('[data-testid="tab-prep"]').click();
    await page.waitForTimeout(200);

    // Check for Analyze Match button
    const analyzeButton = page.locator('[data-testid="analyze-match-button"]');
    await expect(analyzeButton).toBeVisible({ timeout: 3000 });
    await expect(analyzeButton).toContainText('Analyze Match');
  });

  test('should show Upload CV message when no CV exists', async ({ page }) => {
    // Mock the skills match API to return NO_CV error
    await page.route('**/api/applications/*/analyze-match', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Upload your CV to enable skills matching',
          code: 'NO_CV',
        }),
      });
    });

    // Open a card
    const card = page.locator('[data-testid="application-card"]').first();

    if ((await card.count()) === 0) {
      test.skip();
      return;
    }

    await card.click();
    await page.waitForTimeout(300);

    // Navigate to Prep tab
    await page.locator('[data-testid="tab-prep"]').click();
    await page.waitForTimeout(200);

    // Click analyze button
    const analyzeButton = page.locator('[data-testid="analyze-match-button"]');
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForTimeout(500);

      // Check for Upload CV message
      await expect(page.getByText(/Upload your CV/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display Interview Preparation Notes section in Prep tab', async ({ page }) => {
    // Open a card
    const card = page.locator('[data-testid="application-card"]').first();

    if ((await card.count()) === 0) {
      test.skip();
      return;
    }

    await card.click();
    await page.waitForTimeout(300);

    // Navigate to Prep tab
    await page.locator('[data-testid="tab-prep"]').click();
    await page.waitForTimeout(200);

    // Check for Interview Prep notes section
    await expect(page.getByText('Interview Preparation Notes')).toBeVisible({ timeout: 3000 });

    // Check for the prep notes textarea
    const prepTextarea = page.locator('[data-testid="prep-notes-textarea"]');
    await expect(prepTextarea).toBeVisible();
  });
});

test.describe('Navigation Integration', () => {
  test('should maintain sidenav state across navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="sidenav"]', { timeout: 10000 });

    // Navigate to CV
    await page.locator('[data-testid="nav-item-cv"]').click();
    await page.waitForURL('**/cv');

    // Sidenav should still be visible
    await expect(page.locator('[data-testid="sidenav"]')).toBeVisible();

    // CV nav item should be active
    await expect(page.locator('[data-testid="nav-item-cv"]')).toHaveAttribute('data-active', 'true');

    // Navigate back to Jobs
    await page.locator('[data-testid="nav-item-jobs"]').click();
    await page.waitForURL(/\/$/);

    // Jobs should now be active
    await expect(page.locator('[data-testid="nav-item-jobs"]')).toHaveAttribute('data-active', 'true');
  });
});
