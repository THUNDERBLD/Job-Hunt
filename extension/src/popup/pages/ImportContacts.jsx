import { useRef, useState } from 'react'
import { downloadImportTemplate, importContacts } from '../../utils/api.js'
import { Toast, PageHeader } from '../components/UI.jsx'
import { C, F, S } from '../../styles.js'

export default function ImportContacts() {
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const inputRef = useRef(null)

  const pickFile = () => inputRef.current?.click()

  const handlePick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setFileName(file.name)
    setLoading(true)
    try {
      const result = await importContacts(file)
      setToast({ message: result.message || 'Import complete', type: 'success' })
    } catch (err) {
      setToast({
        message: err.status === 401
          ? 'Please log in first so the backend can accept the import'
          : err.message || 'Import failed',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, display:'flex', flexDirection:'column' }}>
      <PageHeader tag="Import" title="Upload Excel Sheet" />

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ width:'100%', maxWidth:520, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <p style={{ fontFamily:F.mono, fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>
            Excel import
          </p>
          <p style={{ fontFamily:F.sans, fontSize:14, color:C.textDim, lineHeight:1.7, marginBottom:18 }}>
            Choose your `.xlsx` file and the backend will insert the rows into MongoDB.
          </p>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={pickFile} disabled={loading} style={{ ...S.btn.primary, width:'auto' }}>
              {loading ? 'Importing...' : 'Choose File'}
            </button>
            <button onClick={downloadImportTemplate} style={{ ...S.btn.ghost, width:'auto' }}>
              Download Template
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handlePick}
            style={{ display:'none' }}
          />

          <div style={{ marginTop:18, fontFamily:F.mono, fontSize:10, color:C.muted }}>
            {fileName ? `Selected: ${fileName}` : 'No file selected yet.'}
          </div>

          <div style={{ marginTop:14, padding:12, border:`1px dashed ${C.border2}`, borderRadius:10, color:C.textDim, fontFamily:F.mono, fontSize:10, lineHeight:1.7 }}>
            Keep the first row headers matching the template. The import route expects `Person`, `Companies`, `Links`, `Priority`, and similar columns.
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
