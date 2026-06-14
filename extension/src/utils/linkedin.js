// Scrape profile data from the active LinkedIn tab
export const scrapeCurrentProfile = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab?.url?.includes('linkedin.com/in/')) {
        return reject(new Error('not_linkedin'))
      }
      chrome.tabs.sendMessage(tab.id, { type: 'GET_PROFILE' }, (response) => {
        if (chrome.runtime.lastError) return reject(new Error('content_script_not_ready'))
        resolve(response)
      })
    })
  })
}

export const isLinkedInProfile = () =>
  new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
      resolve(tabs[0]?.url?.includes('linkedin.com/in/') || false)
    )
  })

// ── Status config ─────────────────────────────────────────────
export const STATUS_LABELS = {
  discovered:      'Discovered',
  connection_sent: 'Req Sent',
  connected:       'Connected',
  messaged:        'Messaged',
  email_sent:      'Email Sent',
  replied:         'Replied 🎉',
  in_process:      'In Process',
  rejected:        'Rejected',
  on_hold:         'On Hold',
}

export const STATUS_COLORS = {
  discovered:      'text-textDim  border-border',
  connection_sent: 'text-blue-400 border-blue-400/30',
  connected:       'text-blue-300 border-blue-300/30',
  messaged:        'text-warn     border-warn/30',
  email_sent:      'text-warn     border-warn/30',
  replied:         'text-accent   border-accent/30',
  in_process:      'text-accent   border-accent/30',
  rejected:        'text-danger   border-danger/30',
  on_hold:         'text-muted    border-muted/30',
}

export const PRIORITY_COLORS = {
  high: 'text-danger',
  mid:  'text-warn',
  low:  'text-textDim',
}

// What status comes next logically
export const NEXT_STATUS = {
  discovered:      'connection_sent',
  connection_sent: 'connected',
  connected:       'messaged',
  messaged:        'replied',
  email_sent:      'replied',
  replied:         'in_process',
}

export const ALL_STATUSES = Object.keys(STATUS_LABELS)
export const ALL_PRIORITIES = ['high', 'mid', 'low']