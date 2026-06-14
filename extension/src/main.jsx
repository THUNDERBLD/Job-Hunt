import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './popup/App.jsx'
import ImportContacts from './popup/pages/ImportContacts.jsx'

const params = new URLSearchParams(window.location.search)
const view = params.get('view')
const Root = view === 'import' ? ImportContacts : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
