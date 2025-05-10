// src/pages/summarizer.tsx - Fixed version

import React from 'react';
import { SummaryView } from '../components/SummaryView';

export default function Summarizer() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Générateur de Résumés</h3>
          <p className="mt-1 text-sm text-gray-500">
            Entrez l'ID d'un document pour générer son résumé ou cliquez sur "Résumer" depuis la liste des documents
          </p>
        </div>

        <div className="p-6">
          <SummaryView />
        </div>
      </div>
    </div>
  );
}