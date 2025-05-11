import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, History, Upload, User, Search, LogIn, UserPlus } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
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
                to="/history"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/summarize')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <History className="h-5 w-5 mr-1" />
                summarizer
              </Link>

              <Link
                to="/chat"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/chat')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {/*<MessageSquare className="h-5 w-5 mr-1" />
                Chat IA*/}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}