// src/pages/PdfViewerWithSummary.tsx - Combined PDF Viewer with Summary
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { summarizeDocument } from '../api/api';
// Use the enhanced PdfViewer component
// Note: You'll need to copy the EnhancedPdfViewer.tsx content to replace your existing PdfViewer.tsx file
// or update the import path if you create it as a new file
import PdfViewer from '../components/PdfViewer';

export default function PdfViewerWithSummary() {
  const { docId } = useParams<{ docId: string }>();
  const [summary, setSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    const generateSummary = async () => {
      if (!docId) return;
      
      try {
        setIsLoadingSummary(true);
        setSummaryError(null);
        const result = await summarizeDocument(docId);
        
        if (result && result.summary) {
          setSummary(result.summary);
        } else {
          setSummaryError("Impossible de générer un résumé pour ce document.");
        }
      } catch (err) {
        console.error('Error generating summary:', err);
        setSummaryError("Une erreur s'est produite lors de la génération du résumé");
      } finally {
        setIsLoadingSummary(false);
      }
    };

    generateSummary();
  }, [docId]);

  return (
    <div className="space-y-6">
      {/* PDF Viewer Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Document PDF</h3>
        </div>
        <div className="p-6">
          <PdfViewer showTitle={false} />
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Résumé du Document</h3>
        </div>
        <div className="p-6">
          {isLoadingSummary && (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}
          
          {summaryError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              {summaryError}
            </div>
          )}
          
          {!isLoadingSummary && summary && (
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}