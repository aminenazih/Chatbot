import { useState } from 'react';
import { askQuestion } from '../api/api';

interface Answer {
  answer: string;
  document_title: string;
  confidence?: number;
}

export function QuestionForm() {
  const [docId, setDocId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);  // Track loading state
  const [error, setError] = useState<string | null>(null);  // Track error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent default form submission
    setLoading(true);
    setError(null); // Clear previous errors

    if (!docId || !question) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const result = await askQuestion(docId, question);
      setAnswer(result);
      setDocId('');  // Clear docId input after successful submission
      setQuestion('');  // Clear question input after successful submission
    } catch (err) {
      setError('Une erreur est survenue lors de la récupération de la réponse.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="ID du document"
            className="border p-2 rounded flex-1"
            required
            disabled={loading}  // Disable while loading
          />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            className="border p-2 rounded flex-1"
            required
            disabled={loading}  // Disable while loading
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={loading}  // Disable while loading
        >
          {loading ? (
            <span className="flex justify-center items-center">
              <div className="w-4 h-4 border-4 border-t-4 border-white border-solid rounded-full animate-spin" />
            </span>
          ) : (
            'Envoyer'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-2 text-red-600" aria-live="assertive">
          <p>{error}</p>
        </div>
      )}

      {answer && (
        <div className="mt-4" aria-live="polite">
          <p><strong>Réponse:</strong> {answer.answer}</p>
          <p><em>Document:</em> {answer.document_title}</p>
          {answer.confidence && <p><em>Confiance:</em> {answer.confidence}</p>}
        </div>
      )}
    </div>
  );
}
