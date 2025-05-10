import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface PdfViewerProps {
  docId?: string; // Optional prop for when component is used directly
}

const PdfViewer: React.FC<PdfViewerProps> = ({ docId: propDocId }) => {
  const { docId: paramDocId } = useParams<{ docId: string }>();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use either the prop docId or the URL param docId
  const documentId = propDocId || paramDocId;

  useEffect(() => {
    const fetchPdf = async () => {
      if (!documentId) {
        setError('No document ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch PDF URL from the backend
        const response = await fetch(`http://127.0.0.1:8000/documents/${documentId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.pdfUrl) {
          setPdfUrl(data.pdfUrl);
          setError(null);
        } else {
          // Handle case where PDF URL is not in the response
          throw new Error('PDF URL not found in response');
        }
      } catch (error) {
        console.error('Error fetching PDF:', error);
        setError('Impossible de charger le document PDF');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded-md">
        <p>Aucun document PDF disponible.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Visualiseur de Document</h2>
      <iframe
        src={pdfUrl}
        width="100%"
        height="600px"
        title="PDF Viewer"
        className="border rounded-md"
      ></iframe>
    </div>
  );
};

export default PdfViewer;