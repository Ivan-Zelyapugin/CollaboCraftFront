import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyDocuments, deleteDocument } from '../api/document';
import { Document } from '../models/document';
import { sendMessage, hubConnection } from '../api/signalr';

interface DocumentListProps {
  onLogout: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ onLogout }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newUserIds, setNewUserIds] = useState(''); // comma-separated

  useEffect(() => {
    fetchDocuments();

    hubConnection.on('DocumentCreated', (doc: Document) => {
      setDocuments(prev => [...prev, doc]);
    });

    // 👇 Добавь это
    hubConnection.on('DocumentDeleted', (deletedId: number) => {
      setDocuments(prev => prev.filter(doc => doc.id !== deletedId));
    });

    return () => {
      hubConnection.off('DocumentCreated');
      hubConnection.off('DocumentDeleted'); // 👈 обязательно отписывайся
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await getMyDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
  const usernames = newUserIds
    .split(',')
    .map(name => name.trim())
    .filter(name => !!name);

  try {
    await sendMessage('CreateDocument', [{
      Name: newDocTitle,
      Usernames: usernames,
    }]);
    setShowForm(false);
    setNewDocTitle('');
    setNewUserIds('');
  } catch (err) {
    console.error('Failed to create document:', err);
  }
};

  const handleDeleteDocument = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?');
    if (!confirmed) return;

    try {
      await sendMessage('DeleteDocument', [id]);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">My Documents</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(prev => !prev)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {showForm ? 'Cancel' : 'Create Document'}
          </button>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-4 mb-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">New Document</h3>
          <input
            type="text"
            placeholder="Document title"
            className="border px-2 py-1 w-full mb-2"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Usernames (comma-separated)"
            className="border px-2 py-1 w-full mb-2"
            value={newUserIds}
            onChange={(e) => setNewUserIds(e.target.value)}
          />
          <button
            onClick={handleCreateDocument}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : documents.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <Link
                to={`/document/${doc.id}`}
                className="text-blue-500 hover:underline"
              >
                {doc.name || '(No Name)'}
              </Link>
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
