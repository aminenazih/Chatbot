import React, { useState, useEffect } from 'react';
import { Send, Bot, Clock, X, ArrowUpRight, Search, Trash2 } from 'lucide-react';
import { askQuestion } from '../api/api';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  documentId?: string;
}

interface ChatSession {
  id: string;
  documentId: string;
  firstMessage: string;
  timestamp: Date;
  messageCount: number;
  filename?: string;
}

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [docId, setDocId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');

  useEffect(() => {
    const docIdFromUrl = searchParams.get('docId');
    if (docIdFromUrl && !docId) {
      setDocId(docIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const allChatHistory = localStorage.getItem('allChatSessions');
    if (allChatHistory) {
      const parsedSessions = JSON.parse(allChatHistory).map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp)
      }));
      setChatSessions(parsedSessions);
    }
  }, []);

  useEffect(() => {
    if (docId) {
      fetch(`http://localhost:8000/documents/`).then(res => res.json()).then(docs => {
        const doc = docs.find((d: any) => d._id === docId);
        if (doc) setFilename(doc.filename);
      });

      const session = chatSessions.find(s => s.documentId === docId);
      if (session) {
        const saved = localStorage.getItem(`chatSession_${session.id}`);
        if (saved) {
          const parsed = JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
          setMessages(parsed);
          setCurrentSessionId(session.id);
          return;
        }
      }
      const welcome = {
        id: Date.now(),
        text: "Bonjour, je suis votre assistant IA. Comment puis-je vous aider avec votre projet?",
        sender: "bot" as const,
        timestamp: new Date(),
        documentId: docId
      };
      setMessages([welcome]);
      setCurrentSessionId(null);
    }
  }, [docId]);

  useEffect(() => {
    if (messages.length && docId) {
      const session = chatSessions.find(s => s.documentId === docId);
      const sessionId = session?.id || currentSessionId || Date.now().toString();
      localStorage.setItem(`chatSession_${sessionId}`, JSON.stringify(messages));

      const title = filename || messages.find(m => m.sender === 'user')?.text || 'Document';

      if (!session) {
        const newSession = {
          id: sessionId,
          documentId: docId,
          firstMessage: title,
          timestamp: new Date(),
          messageCount: messages.length,
          filename
        };
        const updated = [newSession, ...chatSessions.filter(s => s.documentId !== docId)];
        setChatSessions(updated);
        localStorage.setItem('allChatSessions', JSON.stringify(updated));
        setCurrentSessionId(sessionId);
        setSearchParams({ sessionId });
      } else {
        const updated = chatSessions.map(s => s.documentId === docId ? {
          ...s,
          timestamp: new Date(),
          messageCount: messages.length,
          firstMessage: title
        } : s);
        setChatSessions(updated);
        localStorage.setItem('allChatSessions', JSON.stringify(updated));
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !docId.trim()) return;
    const userMsg = {
      id: Date.now(),
      text: newMessage,
      sender: "user" as const,
      timestamp: new Date(),
      documentId: docId
    };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setIsLoading(true);
    try {
      const result = await askQuestion(docId, userMsg.text);
      const botMsg = {
        id: Date.now() + 1,
        text: result.answer || "Je n'ai pas trouvé de réponse.",
        sender: "bot" as const,
        timestamp: new Date(),
        documentId: docId
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Désolé, une erreur s'est produite.",
        sender: "bot",
        timestamp: new Date(),
        documentId: docId
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    if (currentSessionId) {
      // Only remove the session of the current document
      localStorage.removeItem(`chatSession_${currentSessionId}`);

      const updatedSessions = chatSessions.filter(s => s.id !== currentSessionId);
      setChatSessions(updatedSessions);
      localStorage.setItem('allChatSessions', JSON.stringify(updatedSessions));

      const welcomeMessage = {
        id: Date.now(),
        text: "Historique effacé. Je suis votre assistant IA. Comment puis-je vous aider avec votre projet?",
        sender: "bot" as const,
        timestamp: new Date(),
        documentId: docId
      };

      setMessages([welcomeMessage]);
      setCurrentSessionId(null);
    }
  };

  const deleteSession = (sessionId: string, documentId: string) => {
    localStorage.removeItem(`chatSession_${sessionId}`);
    const updated = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updated);
    localStorage.setItem('allChatSessions', JSON.stringify(updated));
    if (docId === documentId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const loadChatSession = (session: ChatSession) => {
    navigate(`/chat?docId=${session.documentId}&sessionId=${session.id}`);
    setIsHistoryOpen(false);
  };

  return (
    <div className="bg-white shadow rounded-lg h-[calc(100vh-12rem)] relative">
      <div className="h-full flex flex-col">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Bot className="h-6 w-6 text-indigo-600" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Assistant IA</h3>
            {currentSessionId && (
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Session #{currentSessionId.substring(currentSessionId.length - 4)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <Clock className="h-4 w-4 mr-1" />
              Historique
            </button>
            <button 
              onClick={clearChatHistory}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Effacer
            </button>
          </div>
        </div>

        <div className="px-4 py-2">
          <input
            type="text"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="Entrez l'ID du document"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {docId.trim() ? (
            <p className="mt-2 text-xs text-gray-500">
              Document sélectionné : <span className="font-semibold text-indigo-700">{docId}</span>
            </p>
          ) : (
            <p className="mt-2 text-xs text-red-500">
              Veuillez entrer l'ID du document pour continuer.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg rounded-lg px-4 py-2 ${message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs text-right mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 px-4 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading || !docId.trim()}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>

        {isHistoryOpen && (
          <div className="absolute inset-0 bg-white z-10 flex flex-col">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Historique des conversations</h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatSessions.length === 0 ? (
                <p className="text-center text-gray-500">Aucune conversation sauvegardée.</p>
              ) : (
                chatSessions.map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:bg-gray-50">
                    <div onClick={() => loadChatSession(session)} className="cursor-pointer w-full">
                      <p className="text-sm font-medium text-indigo-600 truncate">{session.firstMessage}</p>
                      <p className="text-xs text-gray-500">{session.timestamp.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Document: {session.documentId}</p>
                    </div>
                    <button onClick={() => deleteSession(session.id, session.documentId)} className="ml-4 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
