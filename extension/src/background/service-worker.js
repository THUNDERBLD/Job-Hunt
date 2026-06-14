// Caches the latest scraped profile in memory
// so the popup can access it instantly on open
let latestProfile = null

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PROFILE_READY') {
    latestProfile = msg.payload
  }
  if (msg.type === 'GET_LATEST_PROFILE') {
    sendResponse(latestProfile)
  }
  return true
})

// Clear cache when tab changes
chrome.tabs.onActivated.addListener(() => {
  latestProfile = null
})