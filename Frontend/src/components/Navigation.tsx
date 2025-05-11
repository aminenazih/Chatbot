// src/components/Navigation.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, History, Upload, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">PFE Manager</span>
            </Link>

            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="h-5 w-5 mr-1" />
                Tableau de bord
              </Link>

              <Link
                to="/submit"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/submit')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Upload className="h-5 w-5 mr-1" />
                Soumettre
              </Link>

              <Link
                to="/summarize"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/summarize')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <History className="h-5 w-5 mr-1" />
                Résumé
              </Link>

              <Link
                to="/chat"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/chat')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="h-5 w-5 mr-1" />
                Chat IA
              </Link>
            </div>
          </div>

        
        </div>
      </div>
    </nav>
  );
}