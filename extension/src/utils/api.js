// Set VITE_API_URL in extension/.env to override (e.g. https://your-server.com/api)
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  || 'http://localhost:8000/api'

const priorityToApi = {
  high: 'High',
  mid: 'Mid',
  low: 'Low',
}

const priorityFromApi = {
  High: 'high',
  Mid: 'mid',
  Low: 'low',
}

const companyTypeFromStartups = (value) => {
  const raw = String(value || '').trim().toLowerCase()
  if (raw === 'yes') return 'startup'
  if (raw === 'mnc') return 'mnc'
  return 'unknown'
}

const companyTypeToStartups = (value) => {
  if (value === 'startup') return 'Yes'
  if (value === 'mnc') return 'MNC'
  return ''
}

const normalizeContact = (contact = {}) => ({
  ...contact,
  name: contact.name ?? contact.person ?? '',
  company: contact.company ?? contact.companies ?? '',
  linkedinUrl: contact.linkedinUrl ?? contact.links ?? '',
  social: contact.social ?? contact.socials ?? 'LinkedIn',
  companyType: contact.companyType ?? companyTypeFromStartups(contact.startups),
  priority: priorityFromApi[contact.priority] ?? String(contact.priority || 'mid').toLowerCase(),
})

const normalizeStats = (stats = {}) => ({
  ...stats,
  highPriority: stats.highPriority ?? stats.byPriority?.High ?? 0,
})

const mapContactToApi = (contact = {}) => ({
  person: contact.name,
  position: contact.position,
  companies: contact.company,
  companyType: contact.companyType,
  startups: companyTypeToStartups(contact.companyType),
  links: contact.linkedinUrl,
  email: contact.email || null,
  socials: contact.social || 'LinkedIn',
  priority: priorityToApi[contact.priority] ?? 'Mid',
  notes: contact.notes || '',
})

const mapUpdateToApi = (changes = {}) => {
  const next = { ...changes }

  if ('name' in next) {
    next.person = next.name
    delete next.name
  }
  if ('company' in next) {
    next.companies = next.company
    delete next.company
  }
  if ('linkedinUrl' in next) {
    next.links = next.linkedinUrl
    delete next.linkedinUrl
  }
  if ('social' in next) {
    next.socials = next.social
    delete next.social
  }
  if ('companyType' in next) {
    next.startups = companyTypeToStartups(next.companyType)
  }
  if ('priority' in next) {
    next.priority = priorityToApi[next.priority] ?? next.priority
  }

  return next
}

const getStoredToken = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const fromChrome = await new Promise((resolve) => {
      chrome.storage.local.get(['jobhunt_token', 'token', 'authToken'], (result) => {
        resolve(result.jobhunt_token || result.token || result.authToken || '')
      })
    })
    if (fromChrome) return fromChrome
  }

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('jobhunt_token')
      || localStorage.getItem('token')
      || localStorage.getItem('authToken')
      || ''
  }

  return ''
}

const request = async (method, path, body = null, options = {}) => {
  const token = await getStoredToken()
  const headers = { ...(options.headers || {}) }
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.error || data.message || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

// ── Token helpers ─────────────────────────────────────────────
const storeToken = async (token) => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await new Promise((resolve) => {
      chrome.storage.local.set({ jobhunt_token: token }, resolve)
    })
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('jobhunt_token', token)
  }
}

const clearToken = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await new Promise((resolve) => {
      chrome.storage.local.remove(['jobhunt_token', 'token', 'authToken'], resolve)
    })
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('jobhunt_token')
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
  }
}

export const isLoggedIn = async () => {
  const token = await getStoredToken()
  return !!token
}

// ── Auth ──────────────────────────────────────────────────────
export const login = async (email, password) => {
  const data = await request('POST', '/auth/login', { email, password })
  if (data.token) await storeToken(data.token)
  return data
}

export const register = async (name, email, password) => {
  const data = await request('POST', '/auth/register', { name, email, password })
  if (data.token) await storeToken(data.token)
  return data
}

export const logout = async () => {
  await clearToken()
}

export const getMe = () => request('GET', '/auth/me')
export const updateUserProfile = (data) => request('PUT', '/auth/profile', data)
export const updateCohereKey = (cohereApiKey) => request('PUT', '/auth/cohere-key', { cohereApiKey })
export const removeCohereKey = () => request('DELETE', '/auth/cohere-key')
export const updateGeminiKey = (geminiApiKey) => request('PUT', '/auth/gemini-key', { geminiApiKey })
export const removeGeminiKey = () => request('DELETE', '/auth/gemini-key')

// ── Contacts ──────────────────────────────────────────────────
export const getContacts = async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  const data = await request('GET', `/contacts${qs ? `?${qs}` : ''}`)
  return {
    ...data,
    stats: normalizeStats(data.stats),
    data: (data.data || []).map(normalizeContact),
  }
}

export const getContact = async (id) => {
  const data = await request('GET', `/contacts/${id}`)
  return { ...data, data: normalizeContact(data.data) }
}

export const createContact = async (contact) => {
  const data = await request('POST', '/contacts', mapContactToApi(contact))
  return { ...data, data: normalizeContact(data.data) }
}

export const updateContact = async (id, changes) => {
  const data = await request('PUT', `/contacts/${id}`, mapUpdateToApi(changes))
  return { ...data, data: normalizeContact(data.data) }
}

export const deleteContact = (id) => request('DELETE', `/contacts/${id}`)

export const importContacts = async (file) => {
  const form = new FormData()
  form.append('file', file)
  return request('POST', '/import', form)
}

export const exportContacts = () => window.open(`${BASE_URL}/contacts/export`, '_blank')
export const downloadImportTemplate = () => window.open(`${BASE_URL}/import/template`, '_blank')



// ── AI Generation ─────────────────────────────────────────────
export const generateContent = (contactId, type, jobDescription = '') =>
  request('POST', '/generate', { contactId, type, jobDescription })
