// src/pages/Chat.tsx - Fixed version

import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { askQuestion } from '../api/api';

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour, je suis votre assistant IA. Comment puis-je vous aider avec votre projet?", sender: "bot" },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [docId, setDocId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && docId.trim()) {
      // Add user's message
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), text: newMessage, sender: "user" },
      ]);
      
      const userQuestion = newMessage;
      setNewMessage('');
      setIsLoading(true);

      try {
        // Get the bot's response using the fixed askQuestion function
        const result = await askQuestion(docId, userQuestion);
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            id: Date.now() + 1, 
            text: result.answer || "Je n'ai pas trouvé de réponse.", 
            sender: "bot" 
          },
        ]);
      } catch (error) {
        console.error("Error fetching response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            id: Date.now() + 1, 
            text: "Désolé, une erreur s'est produite lors de la recherche de réponse.", 
            sender: "bot" 
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg h-[calc(100vh-12rem)]">
      <div className="h-full flex flex-col">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Bot className="h-6 w-6 text-indigo-600" />
            <h3 className="ml-2 text-lg font-medium text-gray-900">Assistant IA</h3>
          </div>
        </div>

        <div className="px-4 py-2">
          {/* Input for docId */}
          <input
            type="text"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="Entrez l'ID du document"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-lg rounded-lg px-4 py-2 ${
                  message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
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
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}