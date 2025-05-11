import React, { useState } from 'react';
import { Upload, X, File, Check } from 'lucide-react';
import { uploadPDF } from '../api/api'; // Make sure this path is correct

export default function ProjectSubmission() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || files.length === 0) {
      setMessage('Veuillez remplir tous les champs et ajouter au moins un fichier PDF.');
      return;
    }

    try {
      for (const file of files) {
        await uploadPDF(file); // Call your API to upload each PDF
      }
      setMessage('Projet soumis avec succès !');
      setFiles([]);
      setTitle('');
      setDescription('');
    } catch (error) {
      setMessage("Erreur lors de la soumission du projet.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Soumettre un nouveau projet</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre du projet</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Entrez le titre de votre projet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Décrivez votre projet..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">
                  Glissez-déposez vos fichiers ici, ou{' '}
                  <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer">
                    parcourez
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="application/pdf"
                      onChange={handleFileInput}
                    />
                  </label>
                </p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <ul className="mt-4 divide-y divide-gray-200">
              {files.map((file, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-700">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {message && (
            <p className="text-sm text-center text-indigo-600">{message}</p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Check className="h-4 w-4 mr-2" />
              Soumettre le projet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
