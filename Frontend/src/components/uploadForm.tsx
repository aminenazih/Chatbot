import { useState } from 'react'
import { uploadPDF } from '../api'

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return
    try {
      const result = await uploadPDF(file)
      setMessage(Fichier "${result.filename}" uploadé !)
    } catch {
      setMessage("Erreur lors de l'upload")
    }
  }

  return (
    <div className="p-4 border rounded">
      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} className="ml-2 px-4 py-1 bg-blue-500 text-white rounded">Uploader</button>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  )
}