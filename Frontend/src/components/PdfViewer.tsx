import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface PdfViewerProps {
  docId?: string; // Optional prop for when component is used directly
  height?: string; // Allow customizing the iframe height
  showTitle?: boolean; // Option to hide the title when used in a parent component that has its own title
}

const PdfViewer: React.FC<PdfViewerProps> = ({ 
  docId: propDocId, 
  height = '600px',
  showTitle = true 
}) => {
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
        const apiUrl = `http://127.0.0.1:8000/documents/${documentId}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // Try different possible response structures
        if (responseData && responseData.pdfUrl) {
          setPdfUrl(responseData.pdfUrl);
        } else if (responseData && responseData.file && responseData.file.url) {
          setPdfUrl(responseData.file.url);
        } else if (responseData && responseData.url) {
          setPdfUrl(responseData.url);
        } else {
          throw new Error('PDF URL not found in response');
        }
        
        setError(null);
      } catch (error: any) {
        console.error('Error fetching PDF:', error);
        setError(`Impossible de charger le document PDF: ${error.message}`);
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
      {showTitle && <h2 className="text-xl font-semibold mb-4">Visualiseur de Document</h2>}
      <iframe
        src={pdfUrl}
        width="100%"
        height={height}
        title="PDF Viewer"
        className="border rounded-md"
      ></iframe>
    </div>
  );
};

export default PdfViewer;