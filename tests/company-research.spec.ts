import { test, expect } from '@playwright/test';

test.describe('Company Research Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to fully hydrate and load application data
    // The page first shows loading skeletons, then real cards after API call
    await page.waitForSelector('[data-testid="application-card"]', { timeout: 15000 });
  });

  test.describe('Card Detail Modal Opens', () => {
    test('should open modal when clicking on an application card', async ({ page }) => {
      // Find an application card and click it
      const card = page.locator('[data-testid="application-card"]').first();

      // Skip if no cards are present
      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();

      // Verify modal slides in (it has role="dialog")
      const modal = page.locator('[role="dialog"][data-testid="card-detail-modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });
    });

    test('should display all 4 tabs in the modal', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300); // Wait for animation

      // Verify all 4 tabs are visible
      await expect(page.locator('[data-testid="tab-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-research"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-prep"]')).toBeVisible();
      await expect(page.locator('[data-testid="tab-timeline"]')).toBeVisible();
    });

    test('should show tab labels with keyboard shortcuts', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Check that tabs show their shortcuts (1, 2, 3, 4)
      await expect(page.locator('[data-testid="tab-details"]')).toContainText('1');
      await expect(page.locator('[data-testid="tab-research"]')).toContainText('2');
      await expect(page.locator('[data-testid="tab-prep"]')).toContainText('3');
      await expect(page.locator('[data-testid="tab-timeline"]')).toContainText('4');
    });
  });

  test.describe('Tab Navigation Works', () => {
    test('should switch tabs when clicking on tab buttons', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Research tab
      await page.locator('[data-testid="tab-research"]').click();
      await expect(page.locator('[data-testid="research-tab-content"]')).toBeVisible();

      // Click Prep tab
      await page.locator('[data-testid="tab-prep"]').click();
      await expect(page.locator('[data-testid="prep-tab-content"]')).toBeVisible();

      // Click Timeline tab
      await page.locator('[data-testid="tab-timeline"]').click();
      await expect(page.locator('[data-testid="timeline-tab-content"]')).toBeVisible();

      // Click Details tab to go back
      await page.locator('[data-testid="tab-details"]').click();
      await expect(page.locator('[data-testid="details-tab-content"]')).toBeVisible();
    });

    test('should switch tabs with keyboard shortcuts 1, 2, 3, 4', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Press '2' to go to Research tab
      await page.keyboard.press('2');
      await expect(page.locator('[data-testid="research-tab-content"]')).toBeVisible();

      // Press '3' to go to Prep tab
      await page.keyboard.press('3');
      await expect(page.locator('[data-testid="prep-tab-content"]')).toBeVisible();

      // Press '4' to go to Timeline tab
      await page.keyboard.press('4');
      await expect(page.locator('[data-testid="timeline-tab-content"]')).toBeVisible();

      // Press '1' to go back to Details tab
      await page.keyboard.press('1');
      await expect(page.locator('[data-testid="details-tab-content"]')).toBeVisible();
    });

    test('should close modal with Escape key', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[data-testid="card-detail-modal"]');
      await expect(modal).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Modal should be hidden
      await expect(modal).not.toBeVisible();
    });

    test('should close modal when clicking outside (backdrop)', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[data-testid="card-detail-modal"]');
      await expect(modal).toBeVisible();

      // Click on the backdrop (the overlay behind the modal)
      await page.locator('[data-testid="modal-backdrop"]').click({ force: true });
      await page.waitForTimeout(300);

      // Modal should be hidden
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Details Tab', () => {
    test('should display editable company name field', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Details tab should be active by default
      const companyInput = page.locator('#company');
      await expect(companyInput).toBeVisible();

      // Should have a value
      const currentValue = await companyInput.inputValue();
      expect(currentValue.length).toBeGreaterThan(0);
    });

    test('should enable save button when company name is changed', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Save button should be disabled initially (no changes)
      const saveButton = page.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeDisabled();

      // Change the company name
      const companyInput = page.locator('#company');
      await companyInput.fill('Test Company Modified');

      // Save button should now be enabled
      await expect(saveButton).toBeEnabled();
    });

    test('should display status dropdown', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      const statusDropdown = page.locator('[data-testid="status-dropdown"]');
      await expect(statusDropdown).toBeVisible();
    });

    test('should change status via dropdown', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click the status dropdown to open it
      const statusDropdown = page.locator('[data-testid="status-dropdown"]');
      await statusDropdown.click();

      // Select "Interviewing" option
      await page.locator('button:has-text("Interviewing")').click();
      await page.waitForTimeout(200);

      // Verify the dropdown now shows "Interviewing"
      await expect(statusDropdown).toContainText('Interviewing');

      // Save button should be enabled
      const saveButton = page.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
    });

    test('should allow adding notes', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      const notesTextarea = page.locator('#notes');
      await expect(notesTextarea).toBeVisible();

      // Add some notes
      await notesTextarea.fill('Test interview notes: Remember to ask about team structure.');

      // Save button should be enabled
      const saveButton = page.locator('[data-testid="save-button"]');
      await expect(saveButton).toBeEnabled();
    });

    test('should save changes with Cmd+S', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Make a change
      const companyInput = page.locator('#company');
      await companyInput.fill('Test Company for Save');

      // Mock the API
      await page.route('**/api/applications/*', async (route) => {
        if (route.request().method() === 'PATCH') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          });
        } else {
          await route.continue();
        }
      });

      // Press Cmd+S (or Ctrl+S on Windows/Linux)
      await page.keyboard.press('Meta+s');
      await page.waitForTimeout(500);

      // Modal should close after save
      const modal = page.locator('[data-testid="card-detail-modal"]');
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Research Tab', () => {
    test('should show loading state when entering research tab', async ({ page }) => {
      // Intercept research API to add delay
      await page.route('**/api/research/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            company: {
              overview: 'Test company overview',
              funding: '$100M Series C',
              culture: 'Fast-paced startup culture',
              news: ['Recent news item 1', 'Recent news item 2'],
            },
            role: {
              responsibilities: ['Build features', 'Review code'],
              skills: ['React', 'TypeScript', 'Node.js'],
              interviewTips: ['Prepare STAR stories', 'Research the team'],
            },
          }),
        });
      });

      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Research tab
      await page.locator('[data-testid="tab-research"]').click();

      // Should show loading state (skeleton)
      await expect(page.locator('[data-testid="research-loading"]')).toBeVisible();
    });

    test('should display company section in research tab', async ({ page }) => {
      // Mock the research API with immediate response
      await page.route('**/api/research/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            company: {
              overview: 'Test company overview text',
              funding: '$100M Series C funding',
              culture: 'Fast-paced startup culture',
              news: ['Recent news item 1', 'Recent news item 2'],
            },
            role: {
              responsibilities: ['Build features', 'Review code'],
              skills: ['React', 'TypeScript', 'Node.js'],
              interviewTips: ['Prepare STAR stories', 'Research the team'],
            },
          }),
        });
      });

      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Research tab
      await page.locator('[data-testid="tab-research"]').click();
      await page.waitForTimeout(1000);

      // Check for company section
      await expect(page.locator('[data-testid="research-company-section"]')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Test company overview text')).toBeVisible();
    });

    test('should display role section in research tab', async ({ page }) => {
      // Mock the research API
      await page.route('**/api/research/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            company: {
              overview: 'Company overview',
              funding: 'Funding info',
              culture: 'Culture info',
              news: [],
            },
            role: {
              responsibilities: ['Build features', 'Review code'],
              skills: ['React', 'TypeScript', 'Node.js'],
              interviewTips: ['Prepare STAR stories'],
            },
          }),
        });
      });

      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Research tab
      await page.locator('[data-testid="tab-research"]').click();
      await page.waitForTimeout(1000);

      // Check for role section
      await expect(page.locator('[data-testid="research-role-section"]')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Build features')).toBeVisible();
      await expect(page.getByText('React')).toBeVisible();
    });

    test('should have Refresh Research button', async ({ page }) => {
      // Mock the research API
      await page.route('**/api/research/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            company: {
              overview: 'Overview',
              funding: 'Funding',
              culture: 'Culture',
              news: [],
            },
            role: {
              responsibilities: ['Task'],
              skills: ['Skill'],
              interviewTips: ['Tip'],
            },
          }),
        });
      });

      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Research tab
      await page.locator('[data-testid="tab-research"]').click();
      await page.waitForTimeout(1000);

      // Check for refresh button
      const refreshButton = page.locator('[data-testid="refresh-research-button"]');
      await expect(refreshButton).toBeVisible({ timeout: 5000 });
    });

    test('should show error state when research fails', async ({ page }) => {
      // Mock the research API to fail
      await page.route('**/api/research/*', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to fetch research' }),
        });
      });

      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Research tab
      await page.locator('[data-testid="tab-research"]').click();
      await page.waitForTimeout(1000);

      // Check for error state
      await expect(page.locator('[data-testid="research-error"]')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/try again/i)).toBeVisible();
    });
  });

  test.describe('Prep Tab', () => {
    test('should display prep notes textarea', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Prep tab
      await page.locator('[data-testid="tab-prep"]').click();
      await page.waitForTimeout(200);

      // Check for prep notes textarea
      const prepTextarea = page.locator('[data-testid="prep-notes-textarea"]');
      await expect(prepTextarea).toBeVisible();
    });

    test('should allow typing in prep notes', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Prep tab
      await page.locator('[data-testid="tab-prep"]').click();
      await page.waitForTimeout(200);

      // Type in the textarea
      const prepTextarea = page.locator('[data-testid="prep-notes-textarea"]');
      await prepTextarea.fill('## Questions to Expect\n- Tell me about yourself\n- Why this company?');

      // Verify the text was entered
      await expect(prepTextarea).toHaveValue(/Questions to Expect/);
    });

    test('should show auto-save indicator on blur', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Prep tab
      await page.locator('[data-testid="tab-prep"]').click();
      await page.waitForTimeout(200);

      // Type something and blur
      const prepTextarea = page.locator('[data-testid="prep-notes-textarea"]');
      await prepTextarea.fill('Test prep notes');

      // Click somewhere else to trigger blur
      await page.locator('[data-testid="tab-prep"]').click();

      // Should briefly show saving indicator
      const savingIndicator = page.locator('[data-testid="prep-saving-indicator"]');
      // The indicator appears briefly, so we just check it exists
      await expect(savingIndicator).toBeAttached({ timeout: 2000 });
    });

    test('should display suggested sections buttons', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Prep tab
      await page.locator('[data-testid="tab-prep"]').click();
      await page.waitForTimeout(200);

      // Check for suggested section buttons
      await expect(page.getByRole('button', { name: /questions to expect/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /topics to review/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /questions to ask/i })).toBeVisible();
    });

    test('should add section template when clicking suggested section button', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Prep tab
      await page.locator('[data-testid="tab-prep"]').click();
      await page.waitForTimeout(200);

      // Clear the textarea first
      const prepTextarea = page.locator('[data-testid="prep-notes-textarea"]');
      await prepTextarea.fill('');

      // Click a suggested section button
      await page.getByRole('button', { name: /questions to expect/i }).click();

      // Verify the section was added
      await expect(prepTextarea).toHaveValue(/Questions to Expect/);
    });
  });

  test.describe('Timeline Tab', () => {
    test('should display timeline content', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Timeline tab
      await page.locator('[data-testid="tab-timeline"]').click();
      await page.waitForTimeout(200);

      // Check for timeline content
      const timelineContent = page.locator('[data-testid="timeline-tab-content"]');
      await expect(timelineContent).toBeVisible();
    });

    test('should show application created date', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Timeline tab
      await page.locator('[data-testid="tab-timeline"]').click();
      await page.waitForTimeout(200);

      // Should show created/applied date
      const createdEntry = page.locator('[data-testid="timeline-created-date"]');
      await expect(createdEntry).toBeVisible();

      // Should contain text about application submitted or job saved
      await expect(page.getByText(/application submitted|job saved/i)).toBeVisible();
    });

    test('should show emails in timeline when present', async ({ page }) => {
      // Mock the emails API
      await page.route('**/api/applications/*/emails', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            emails: [
              {
                id: 'email-1',
                gmailMessageId: 'gmail-123',
                subject: 'Your application was received',
                from: 'recruiting@company.com',
                date: new Date().toISOString(),
                snippet: 'Thank you for your application...',
                emailType: 'application_confirmation',
              },
            ],
          }),
        });
      });

      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Timeline tab
      await page.locator('[data-testid="tab-timeline"]').click();
      await page.waitForTimeout(1000);

      // Should show the email in timeline
      await expect(page.getByText('Your application was received')).toBeVisible({ timeout: 5000 });
    });

    test('should expand email details when clicked', async ({ page }) => {
      // Mock the emails API
      await page.route('**/api/applications/*/emails', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            emails: [
              {
                id: 'email-1',
                gmailMessageId: 'gmail-123',
                subject: 'Your application was received',
                from: 'recruiting@company.com',
                date: new Date().toISOString(),
                snippet: 'Thank you for your application...',
                emailType: 'application_confirmation',
              },
            ],
          }),
        });
      });

      // Mock the email detail API
      await page.route('**/api/emails/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            email: {
              body: 'Full email body content here. Thank you for applying to our position.',
              gmailUrl: 'https://mail.google.com/mail/u/0/#inbox/123',
            },
          }),
        });
      });

      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Click Timeline tab
      await page.locator('[data-testid="tab-timeline"]').click();
      await page.waitForTimeout(1000);

      // Click on the email to expand it
      await page.getByText('Your application was received').click();
      await page.waitForTimeout(500);

      // Should show expanded content with Gmail link
      await expect(page.getByText('Open in Gmail')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should not trigger tab shortcuts when typing in input', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Focus on company input
      const companyInput = page.locator('#company');
      await companyInput.focus();
      await companyInput.fill('Company2');

      // Should still be on Details tab (the '2' should not trigger tab change)
      await expect(page.locator('[data-testid="details-tab-content"]')).toBeVisible();
    });

    test('should close status dropdown with Escape', async ({ page }) => {
      const card = page.locator('[data-testid="application-card"]').first();

      if (await card.count() === 0) {
        test.skip();
        return;
      }

      await card.click();
      await page.waitForTimeout(300);

      // Open status dropdown
      const statusDropdown = page.locator('[data-testid="status-dropdown"]');
      await statusDropdown.click();

      // Verify dropdown is open (menu items visible)
      await expect(page.locator('button:has-text("Applied")')).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      // Dropdown menu should be closed but modal still open
      const modal = page.locator('[data-testid="card-detail-modal"]');
      await expect(modal).toBeVisible();
    });
  });
});
