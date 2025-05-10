// src/components/SummaryView.tsx - Fixed version

import { useState } from 'react'
import { summarizeDocument } from '../api/api'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'

export function SummaryView() {
  const [docId, setDocId] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if there's a docId in URL parameters
    const urlDocId = searchParams.get('docId')
    if (urlDocId) {
      setDocId(urlDocId)
      handleSummarize(urlDocId) // Auto-summarize if docId is provided in URL
    }
  }, [searchParams])

  const handleSummarize = async (documentId?: string) => {
    const idToUse = documentId || docId
    
    if (!idToUse) {
      setError("Veuillez fournir un ID de document valide")
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      const result = await summarizeDocument(idToUse)
      
      if (result && result.summary) {
        setSummary(result.summary)
      } else {
        setError("Impossible de générer un résumé. Veuillez réessayer.")
      }
    } catch (err) {
      console.error('Error generating summary:', err)
      setError("Une erreur s'est produite lors de la génération du résumé")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <input 
          value={docId} 
          onChange={(e) => setDocId(e.target.value)} 
          placeholder="ID du document" 
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
          disabled={isLoading}
        />
        <button 
          onClick={() => handleSummarize()} 
          disabled={isLoading}
          className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Génération...' : 'Résumer'}
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      )}
      
      {!isLoading && summary && (
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Résumé du document</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}