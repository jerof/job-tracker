// Job data extraction for various job boards

// Extraction strategies for different sites
const extractors = {
  // LinkedIn Jobs
  linkedin: {
    match: (url) => url.includes('linkedin.com/jobs'),
    extract: () => {
      const data = {};

      // Company name
      const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name a') ||
                        document.querySelector('.jobs-unified-top-card__company-name a') ||
                        document.querySelector('[data-tracking-control-name="public_jobs_topcard-org-name"]') ||
                        document.querySelector('.topcard__org-name-link');
      if (companyEl) {
        data.company = companyEl.textContent.trim();
      }

      // Job title
      const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title h1') ||
                      document.querySelector('.jobs-unified-top-card__job-title') ||
                      document.querySelector('.topcard__title') ||
                      document.querySelector('h1.t-24');
      if (titleEl) {
        data.role = titleEl.textContent.trim();
      }

      // Location
      const locationEl = document.querySelector('.job-details-jobs-unified-top-card__bullet') ||
                         document.querySelector('.jobs-unified-top-card__bullet') ||
                         document.querySelector('.topcard__flavor--bullet');
      if (locationEl) {
        data.location = locationEl.textContent.trim();
      }

      return data;
    }
  },

  // Indeed
  indeed: {
    match: (url) => url.includes('indeed.com'),
    extract: () => {
      const data = {};

      // Company name
      const companyEl = document.querySelector('[data-testid="inlineHeader-companyName"]') ||
                        document.querySelector('.jobsearch-InlineCompanyRating-companyHeader a') ||
                        document.querySelector('.icl-u-lg-mr--sm');
      if (companyEl) {
        data.company = companyEl.textContent.trim();
      }

      // Job title
      const titleEl = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ||
                      document.querySelector('.jobsearch-JobInfoHeader-title') ||
                      document.querySelector('h1.icl-u-xs-mb--xs');
      if (titleEl) {
        data.role = titleEl.textContent.trim();
      }

      // Location
      const locationEl = document.querySelector('[data-testid="job-location"]') ||
                         document.querySelector('[data-testid="inlineHeader-companyLocation"]') ||
                         document.querySelector('.icl-u-xs-mt--xs .icl-u-textColor--secondary');
      if (locationEl) {
        data.location = locationEl.textContent.trim();
      }

      return data;
    }
  },

  // Glassdoor
  glassdoor: {
    match: (url) => url.includes('glassdoor.com'),
    extract: () => {
      const data = {};

      // Company name
      const companyEl = document.querySelector('[data-test="employer-name"]') ||
                        document.querySelector('.employerName') ||
                        document.querySelector('.css-16nw49e');
      if (companyEl) {
        data.company = companyEl.textContent.trim();
      }

      // Job title
      const titleEl = document.querySelector('[data-test="job-title"]') ||
                      document.querySelector('.css-1vg6q84') ||
                      document.querySelector('h1');
      if (titleEl) {
        data.role = titleEl.textContent.trim();
      }

      // Location
      const locationEl = document.querySelector('[data-test="location"]') ||
                         document.querySelector('.css-56kyx5') ||
                         document.querySelector('.location');
      if (locationEl) {
        data.location = locationEl.textContent.trim();
      }

      return data;
    }
  },

  // Ashby (company career pages using Ashby)
  ashby: {
    match: (url) => url.includes('ashbyhq.com') || url.includes('.ashbyhq.'),
    extract: () => {
      const data = {};

      // Job title - usually in h1
      const titleEl = document.querySelector('h1');
      if (titleEl) {
        data.role = titleEl.textContent.trim();
      }

      // Company name - try various locations
      const companyEl = document.querySelector('[class*="company"]') ||
                        document.querySelector('header a') ||
                        document.querySelector('[class*="logo"]');
      if (companyEl) {
        // For Ashby, company is often in the subdomain
        const urlMatch = window.location.hostname.match(/^([^.]+)\.ashbyhq\.com/);
        if (urlMatch) {
          // Convert subdomain to title case
          data.company = urlMatch[1]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }

      // Location - look for location-like text
      const locationEl = document.querySelector('[class*="location"]') ||
                         document.querySelector('[class*="Location"]');
      if (locationEl) {
        data.location = locationEl.textContent.trim();
      }

      return data;
    }
  }
};

// Generic fallback extractor
function extractGeneric() {
  const data = {};

  // Try to get title from h1 or page title
  const h1 = document.querySelector('h1');
  if (h1) {
    data.role = h1.textContent.trim();
  }

  // Try to get company from meta tags or common elements
  const metaCompany = document.querySelector('meta[property="og:site_name"]');
  if (metaCompany) {
    data.company = metaCompany.content;
  }

  return data;
}

// Main extraction function
function extractJobData() {
  const url = window.location.href;

  // Find matching extractor
  for (const [name, extractor] of Object.entries(extractors)) {
    if (extractor.match(url)) {
      console.log(`Using ${name} extractor`);
      return extractor.extract();
    }
  }

  // Fall back to generic extraction
  console.log('Using generic extractor');
  return extractGeneric();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {
    const data = extractJobData();
    sendResponse(data);
  }
  return true; // Keep message channel open for async response
});
