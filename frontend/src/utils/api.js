const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  || 'http://localhost:8000/api'

// Helper mapper for priority
export const priorityToApi = {
  high: 'High',
  mid: 'Mid',
  low: 'Low',
}

export const priorityFromApi = {
  High: 'high',
  Mid: 'mid',
  Low: 'low',
}

export const getStoredToken = () => {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('jobhunt_token') : null
}

const request = async (method, path, body = null, isMultipart = false) => {
  const url = `${BASE_URL}${path}`
  const headers = {}

  const token = getStoredToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json'
  }

  const options = {
    method,
    headers,
  }

  if (body) {
    options.body = isMultipart ? body : JSON.stringify(body)
  }

  const res = await fetch(url, options)

  // Handle binary downloads directly
  const contentType = res.headers.get('content-type')
  if (res.ok && contentType && contentType.includes('spreadsheetml')) {
    return res.blob()
  }

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.message || 'API request failed')
  }
  return json
}

// ── Token helpers ─────────────────────────────────────────────
const storeToken = (token) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('jobhunt_token', token)
  }
}

const clearToken = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('jobhunt_token')
  }
}

export const isLoggedIn = () => {
  return !!getStoredToken()
}

// ── Auth ──────────────────────────────────────────────────────
export const login = async (email, password) => {
  const data = await request('POST', '/auth/login', { email, password })
  if (data.token) storeToken(data.token)
  return data
}

export const register = async (name, email, password) => {
  const data = await request('POST', '/auth/register', { name, email, password })
  if (data.token) storeToken(data.token)
  return data
}

export const logout = () => {
  clearToken()
}

export const getMe = () => request('GET', '/auth/me')
export const updateUserProfile = (data) => request('PUT', '/auth/profile', data)

// API Key controls
export const updateCohereKey = (cohereApiKey) => request('PUT', '/auth/cohere-key', { cohereApiKey })
export const removeCohereKey = () => request('DELETE', '/auth/cohere-key')
export const updateGeminiKey = (geminiApiKey) => request('PUT', '/auth/gemini-key', { geminiApiKey })
export const removeGeminiKey = () => request('DELETE', '/auth/gemini-key')

// ── Contacts ──────────────────────────────────────────────────
export const getContacts = async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request('GET', `/contacts?${qs}`)
}

export const getContact = (id) => request('GET', `/contacts/${id}`)
export const createContact = (data) => request('POST', '/contacts', data)
export const updateContact = (id, data) => request('PUT', `/contacts/${id}`, data)
export const deleteContact = (id) => request('DELETE', `/contacts/${id}`)

// ── Excel Import / Export ─────────────────────────────────────
export const uploadExcelTracker = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request('POST', '/import', formData, true)
}

export const getExcelTemplateBlob = () => {
  return request('GET', '/import/template')
}

export const getExportExcelBlob = () => {
  return request('GET', '/contacts/export')
}

// ── Dashboard ─────────────────────────────────────────────────
export const getDashboardStats = () => request('GET', '/dashboard')

// ── AI Generation ─────────────────────────────────────────────
export const generateOutreachMessage = (contactId, type, jobDescription = '') => {
  return request('POST', '/generate', { contactId, type, jobDescription })
}
export const getAiUsageStats = () => request('GET', '/generate/usage')
