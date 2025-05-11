// src/pages/Dashboard.tsx - With improved document selection for chat

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, MessageCircle, X, Send, Bot, ChevronDown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDocuments, askQuestion } from '../api/api';
import { HealthStatus } from '../components/HealthStatus';



// Define a proper interface for document objects
interface Document {
  _id: string;
  name?: string;
  filename?: string;
  uploadDate?: string;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  documentId?: string;
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(searchParam);


  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  
  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDocSelectorOpen, setIsDocSelectorOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 1, 
      text: "Bonjour, je suis votre assistant IA. Sélectionnez un document pour commencer à discuter.", 
      sender: "bot",
      timestamp: new Date()
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  useEffect(() => {
    // Use the fetchDocuments function from api.ts
    const getDocuments = async () => {
      try {
        setLoading(true);
        const data = await fetchDocuments();
        setDocuments(Array.isArray(data) ? data : []);
        setFilteredDocuments(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getDocuments();
    
    // Set up interval to periodically refresh documents
    const intervalId = setInterval(getDocuments, 30000); // Refresh every 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filtered = documents.filter((doc) => {
      const title = (doc.name || doc.filename || '').toLowerCase();
      return title.includes(searchTerm.toLowerCase());
    });
    setFilteredDocuments(filtered);
  }, [searchTerm, documents]);

  useEffect(() => {
    setSearchTerm(searchParam);
  }, [searchParam]);
  

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDateObjects);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (err) {
      console.error('Error saving chat history:', err);
    }
  }, [messages]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Format chat message timestamp
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Chat functions
  const toggleChat = (docId?: string) => {
    if (docId) {
      setSelectedDocId(docId);
      // Add system message when specific document is selected
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now(),
          text: `Document sélectionné: ${documents.find(d => d._id === docId)?.filename || docId}`,
          sender: 'bot',
          timestamp: new Date(),
          documentId: docId
        }
      ]);
    }
    setIsChatOpen(!isChatOpen);
  };

  const selectDocument = (docId: string) => {
    setSelectedDocId(docId);
    setIsDocSelectorOpen(false);
    
    // Add system message when document is selected from dropdown
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: Date.now(),
        text: `Document sélectionné: ${documents.find(d => d._id === docId)?.filename || docId}`,
        sender: 'bot',
        timestamp: new Date(),
        documentId: docId
      }
    ]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedDocId) {
      return;
    }

    const userQuestion = newMessage;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: userQuestion,
      sender: "user" as const,
      timestamp: new Date(),
      documentId: selectedDocId
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setNewMessage(''); // Clear input
    setIsLoadingChat(true);

    try {
      // Get response from backend
      const result = await askQuestion(selectedDocId, userQuestion);
      
      const botMessage = {
        id: Date.now() + 1,
        text: result.answer || "Je n'ai pas trouvé de réponse.",
        sender: "bot" as const,
        timestamp: new Date(),
        documentId: selectedDocId
      };
      
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          id: Date.now() + 1, 
          text: "Désolé, une erreur s'est produite lors de la recherche de réponse.", 
          sender: "bot",
          timestamp: new Date(),
          documentId: selectedDocId
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const clearChatHistory = () => {
    // Keep only the welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: "Historique effacé. Je suis votre assistant IA. Comment puis-je vous aider avec votre projet?",
      sender: "bot" as const,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    localStorage.removeItem('chatHistory');
  };

  const getSelectedDocumentName = () => {
    if (!selectedDocId) return "Aucun document sélectionné";
    const doc = documents.find(d => d._id === selectedDocId);
    return doc?.filename || doc?.name || selectedDocId;
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Liste des Documents</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <HealthStatus />
        </div>
        
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-4 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Chargement des documents...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => fetchDocuments()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <li key={doc._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <Link 
                            to={`/pdf/${doc._id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            {doc.name || doc.filename || 'Document sans nom'}
                          </Link>
                          {doc.uploadDate && (
                            <p className="text-xs text-gray-500">
                              Uploadé le: {formatDate(doc.uploadDate)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/summarize?docId=${doc._id}`}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
                        >
                          Résumer
                        </Link>
                        <Link
                          to={`/chat?docId=${doc._id}`}
                          className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 flex items-center"
                        >
                        <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                        </Link>

                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  Aucun document trouvé. Commencez par en soumettre un.
                </div>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Floating chat button (always visible) */}
      <button
        onClick={() => toggleChat()}
        className="fixed bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat dialog */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-8 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 flex flex-col" style={{ height: "500px" }}>
          {/* Chat header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="h-6 w-6 mr-2" />
              <h3 className="font-medium">Assistant IA</h3>
            </div>
            <div className="flex items-center">
              <button 
                onClick={clearChatHistory}
                className="text-white hover:text-gray-200 mr-3"
                aria-label="Clear chat history"
              >
                <span className="text-xs">Effacer</span>
              </button>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Document selector dropdown */}
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <div className="relative">
              <button
                onClick={() => setIsDocSelectorOpen(!isDocSelectorOpen)}
                className="w-full flex items-center justify-between text-sm text-gray-700 py-1 px-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                <span className="truncate">
                  {getSelectedDocumentName()}
                </span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              
              {isDocSelectorOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-52 overflow-y-auto">
                  <ul className="py-1">
                    {documents.map((doc) => (
                      <li key={doc._id}>
                        <button
                          onClick={() => selectDocument(doc._id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 truncate"
                        >
                          {doc.filename || doc.name || doc._id}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs text-right mt-1 opacity-70">
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isLoadingChat && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoadingChat || !selectedDocId}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                disabled={isLoadingChat || !selectedDocId || !newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {!selectedDocId && (
              <p className="mt-2 text-xs text-red-500">
                Veuillez sélectionner un document pour discuter.
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}