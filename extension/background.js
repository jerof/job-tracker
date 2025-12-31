// Background service worker for Job Tracker extension

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Badge colors
const BADGE_COLORS = {
  default: '#6366f1',  // Indigo
  success: '#10b981',  // Green
  error: '#ef4444',    // Red
};

// Update badge when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Job Tracker extension installed');
  updateBadge();
});

// Update badge based on auth status
async function updateBadge() {
  try {
    const { authToken } = await chrome.storage.local.get(['authToken']);

    if (authToken) {
      // User is logged in - clear badge
      chrome.action.setBadgeText({ text: '' });
    } else {
      // User needs to log in - show indicator
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.error });
    }
  } catch (e) {
    console.error('Error updating badge:', e);
  }
}

// Listen for storage changes (e.g., when auth token is set)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.authToken) {
    updateBadge();
  }
});

// Check for duplicate job before saving (called from popup)
async function checkDuplicate(company, role) {
  try {
    const { authToken, userId } = await chrome.storage.local.get(['authToken', 'userId']);

    if (!authToken || !userId) {
      return { isDuplicate: false };
    }

    const response = await fetch(
      `${API_BASE_URL}/api/applications/check-duplicate?` +
      new URLSearchParams({ company, role, user_id: userId }),
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      return { isDuplicate: false };
    }

    const data = await response.json();
    return { isDuplicate: data.exists, existingJob: data.job };

  } catch (e) {
    console.error('Error checking duplicate:', e);
    return { isDuplicate: false };
  }
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkDuplicate') {
    checkDuplicate(request.company, request.role)
      .then(sendResponse);
    return true; // Keep channel open for async response
  }

  if (request.action === 'updateBadge') {
    updateBadge();
    sendResponse({ success: true });
  }
});

// Context menu to save job from right-click (optional future feature)
// chrome.contextMenus.create({
//   id: 'save-job',
//   title: 'Save to Job Tracker',
//   contexts: ['page', 'link'],
// });

// chrome.contextMenus.onClicked.addListener((info, tab) => {
//   if (info.menuItemId === 'save-job') {
//     chrome.action.openPopup();
//   }
// });
