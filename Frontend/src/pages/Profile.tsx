import React from 'react';
import { User, Mail, School, Calendar, Check, FileText } from 'lucide-react';

export default function Profile() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                <User className="h-16 w-16 text-indigo-600" />
              </div>
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-white">Mouad agdouz</h3>
              <p className="text-indigo-100">Étudiant en Informatique</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Mail className="h-5 w-5 mr-2" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900">agdouzm1975@gmail.com</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <School className="h-5 w-5 mr-2" />
                Formation
              </dt>
              <dd className="mt-1 text-sm text-gray-900">Master en Génie Logiciel</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="flex items-center text-sm font-medium text-gray-500">
                <Calendar className="h-5 w-5 mr-2" />
                Année académique
              </dt>
              <dd className="mt-1 text-sm text-gray-900">2023-2024</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Statistiques du projet</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Jours restants</div>
                  <div className="text-lg font-semibold text-gray-900">45</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-md bg-green-600 flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Tâches complétées</div>
                  <div className="text-lg font-semibold text-gray-900">12/15</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-md bg-purple-600 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Documents soumis</div>
                  <div className="text-lg font-semibold text-gray-900">8</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}