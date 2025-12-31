// Configuration
const API_BASE_URL = 'http://localhost:3000';

// DOM Elements
const form = document.getElementById('job-form');
const companyInput = document.getElementById('company');
const roleInput = document.getElementById('role');
const locationInput = document.getElementById('location');
const urlInput = document.getElementById('url');
const saveBtn = document.getElementById('save-btn');
const btnText = saveBtn.querySelector('.btn-text');
const btnLoading = saveBtn.querySelector('.btn-loading');
const status = document.getElementById('status');

// Job extraction function - runs in page context
function extractJobDataFromPage() {
  const url = window.location.href;
  const data = {};

  // LinkedIn
  if (url.includes('linkedin.com')) {
    const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name a') ||
                      document.querySelector('.jobs-unified-top-card__company-name a') ||
                      document.querySelector('[data-tracking-control-name="public_jobs_topcard-org-name"]') ||
                      document.querySelector('.topcard__org-name-link') ||
                      document.querySelector('.job-details-jobs-unified-top-card__company-name');
    if (companyEl) data.company = companyEl.textContent.trim();

    const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title h1') ||
                    document.querySelector('.jobs-unified-top-card__job-title') ||
                    document.querySelector('.topcard__title') ||
                    document.querySelector('h1.t-24');
    if (titleEl) data.role = titleEl.textContent.trim();

    const locationEl = document.querySelector('.job-details-jobs-unified-top-card__bullet') ||
                       document.querySelector('.jobs-unified-top-card__bullet') ||
                       document.querySelector('.topcard__flavor--bullet');
    if (locationEl) data.location = locationEl.textContent.trim();
  }
  // Indeed
  else if (url.includes('indeed.com')) {
    const companyEl = document.querySelector('[data-testid="inlineHeader-companyName"]') ||
                      document.querySelector('.jobsearch-InlineCompanyRating-companyHeader a') ||
                      document.querySelector('.icl-u-lg-mr--sm');
    if (companyEl) data.company = companyEl.textContent.trim();

    const titleEl = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ||
                    document.querySelector('.jobsearch-JobInfoHeader-title') ||
                    document.querySelector('h1.icl-u-xs-mb--xs');
    if (titleEl) data.role = titleEl.textContent.trim();

    const locationEl = document.querySelector('[data-testid="job-location"]') ||
                       document.querySelector('[data-testid="inlineHeader-companyLocation"]');
    if (locationEl) data.location = locationEl.textContent.trim();
  }
  // Glassdoor
  else if (url.includes('glassdoor.com')) {
    const companyEl = document.querySelector('[data-test="employer-name"]') ||
                      document.querySelector('.employerName');
    if (companyEl) data.company = companyEl.textContent.trim();

    const titleEl = document.querySelector('[data-test="job-title"]') ||
                    document.querySelector('h1');
    if (titleEl) data.role = titleEl.textContent.trim();

    const locationEl = document.querySelector('[data-test="location"]');
    if (locationEl) data.location = locationEl.textContent.trim();
  }
  // Ashby (jobs.ashbyhq.com/company/...)
  else if (url.includes('ashbyhq.com')) {
    // Company from URL path: jobs.ashbyhq.com/voize/... -> voize
    const pathMatch = url.match(/ashbyhq\.com\/([^\/]+)/);
    if (pathMatch) {
      data.company = pathMatch[1]
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    // Job title from h1
    const titleEl = document.querySelector('h1');
    if (titleEl) data.role = titleEl.textContent.trim();

    // Location - look for common patterns
    const allText = document.body.innerText;
    const locationMatch = allText.match(/(?:Location|Based in)[:\s]*([^\n]+)/i);
    if (locationMatch) data.location = locationMatch[1].trim();
  }
  // Greenhouse
  else if (url.includes('greenhouse.io') || url.includes('boards.greenhouse.io')) {
    const titleEl = document.querySelector('.app-title') || document.querySelector('h1');
    if (titleEl) data.role = titleEl.textContent.trim();

    const companyEl = document.querySelector('.company-name') ||
                      document.querySelector('[class*="company"]');
    if (companyEl) data.company = companyEl.textContent.trim();

    const locationEl = document.querySelector('.location') ||
                       document.querySelector('[class*="location"]');
    if (locationEl) data.location = locationEl.textContent.trim();
  }
  // Lever
  else if (url.includes('lever.co') || url.includes('jobs.lever.co')) {
    const titleEl = document.querySelector('.posting-headline h2') || document.querySelector('h1');
    if (titleEl) data.role = titleEl.textContent.trim();

    const locationEl = document.querySelector('.location') ||
                       document.querySelector('.posting-categories .sort-by-time');
    if (locationEl) data.location = locationEl.textContent.trim();

    // Company from URL: jobs.lever.co/company/...
    const pathMatch = url.match(/lever\.co\/([^\/]+)/);
    if (pathMatch) {
      data.company = pathMatch[1]
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }
  // Workday
  else if (url.includes('myworkdayjobs.com') || url.includes('workday.com')) {
    const titleEl = document.querySelector('[data-automation-id="jobPostingHeader"]') ||
                    document.querySelector('h1');
    if (titleEl) data.role = titleEl.textContent.trim();

    const companyEl = document.querySelector('[data-automation-id="company"]');
    if (companyEl) data.company = companyEl.textContent.trim();
  }
  // Generic fallback
  else {
    // Try h1 for job title
    const h1 = document.querySelector('h1');
    if (h1) data.role = h1.textContent.trim();

    // Try meta tags for company
    const metaSiteName = document.querySelector('meta[property="og:site_name"]');
    if (metaSiteName) data.company = metaSiteName.content;

    // Try page title
    if (!data.role && document.title) {
      // Often format: "Job Title - Company" or "Job Title | Company"
      const titleParts = document.title.split(/[-|]/);
      if (titleParts.length >= 2) {
        data.role = titleParts[0].trim();
        if (!data.company) data.company = titleParts[1].trim();
      }
    }
  }

  return data;
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  showStatus('Extracting job data...', 'loading');

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    urlInput.value = tab.url;

    // Inject and run extraction script
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractJobDataFromPage,
      });

      if (results && results[0]?.result) {
        const data = results[0].result;
        if (data.company) companyInput.value = data.company;
        if (data.role) roleInput.value = data.role;
        if (data.location) locationInput.value = data.location;

        if (data.company || data.role) {
          hideStatus();
        } else {
          showStatus('Could not auto-detect job details. Please fill manually.', 'warning');
        }
      } else {
        hideStatus();
      }
    } catch (e) {
      console.log('Could not extract job data:', e);
      hideStatus();
    }

    // Check for duplicate
    await checkDuplicate(tab.url);
  } else {
    hideStatus();
  }
});

// Check for duplicate job
async function checkDuplicate(url) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/extension/check-duplicate?url=${encodeURIComponent(url)}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.isDuplicate) {
        const app = data.existingApplication;
        showStatus(
          `Already saved: ${app.company} - ${app.role} (${app.status})`,
          'warning'
        );
      }
    }
  } catch (e) {
    console.log('Could not check for duplicates');
  }
}

// Show status message
function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
  status.classList.remove('hidden');
}

// Hide status message
function hideStatus() {
  status.classList.add('hidden');
}

// Set loading state
function setLoading(loading) {
  saveBtn.disabled = loading;
  btnText.classList.toggle('hidden', loading);
  btnLoading.classList.toggle('hidden', !loading);
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideStatus();

  const company = companyInput.value.trim();
  const role = roleInput.value.trim();
  const location = locationInput.value.trim();
  const jobUrl = urlInput.value.trim();

  if (!company || !role) {
    showStatus('Company and role are required', 'error');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/extension/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company,
        role,
        jobUrl,
        location: location || undefined,
        source: 'extension',
      }),
    });

    const data = await response.json();

    if (response.status === 409) {
      const app = data.existingApplication;
      showStatus(
        `Already exists: ${app.company} - ${app.role} (${app.status})`,
        'warning'
      );
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save job');
    }

    showStatus('Job saved to tracker!', 'success');

    // Clear form after short delay
    setTimeout(() => {
      companyInput.value = '';
      roleInput.value = '';
      locationInput.value = '';
      hideStatus();
    }, 2000);

  } catch (error) {
    console.error('Error saving job:', error);
    showStatus(error.message || 'Failed to save job', 'error');
  } finally {
    setLoading(false);
  }
});
