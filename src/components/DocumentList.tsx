import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyDocuments } from '../api/document';
import { Document } from '../models/document';
import { UserDocumentDto, DocumentRole } from '../models/document';
import { sendMessage, hubConnection } from '../api/signalr';

interface DocumentListProps {
  onLogout: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ onLogout }) => {
  const [documents, setDocuments] = useState<UserDocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [userInputs, setUserInputs] = useState([{ username: '', role: 'User' as DocumentRole }]);

  useEffect(() => {
    fetchDocuments();

    hubConnection.on('DocumentCreated', (doc: Document) => {
      setDocuments(prev => [...prev, { document: doc, role: 'Creator' }]);
    });

    hubConnection.on('DocumentDeleted', (deletedId: number) => {
      setDocuments(prev => prev.filter(d => d.document.id !== deletedId));
    });

    return () => {
      hubConnection.off('DocumentCreated');
      hubConnection.off('DocumentDeleted');
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

  const handleUserChange = (index: number, field: 'username' | 'role', value: string) => {
  setUserInputs(prev => {
    const updated = [...prev];
    if (field === 'role') {
      updated[index].role = value as DocumentRole;
    } else {
      updated[index].username = value;
    }
    return updated;
  });
};


  const addUserInput = () => {
    setUserInputs(prev => [...prev, { username: '', role: 'Viewer' }]);
  };

  const removeUserInput = (index: number) => {
    setUserInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateDocument = async () => {
  const users = userInputs
    .map(u => ({ username: u.username.trim(), role: u.role }))
    .filter(u => u.username !== '');

  try {
    await sendMessage('CreateDocument', [{
      Name: newDocTitle,
      Usernames: users.map(u => u.username),
      Roles: users.map(u => u.role),
    }]);
    setShowForm(false);
    setNewDocTitle('');
    setUserInputs([{ username: '', role: 'Viewer' }]);
  } catch (err: any) {
    console.error('Failed to create document:', err);

    if (err.message && err.message.includes('Пользователи не найдены:')) {
      const match = err.message.match(/Пользователи не найдены:\s*(.*)/);
      const notFound = match ? match[1] : '';
      alert(`Документ не создан, но не удалось добавить следующих пользователей: ${notFound}`);
    } else {
      alert('Ошибка при создании документа. Попробуйте позже.');
    }
  }
};


  const handleDeleteDocument = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?');
    if (!confirmed) return;

    try {
      await sendMessage('DeleteDocument', [id]);
      setDocuments(prev => prev.filter(doc => doc.document.id !== id));
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
  <Link
    to="/profile"
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    Профиль
  </Link>
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
            className="border px-2 py-1 w-full mb-4"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
          />

          <div className="space-y-2 mb-4">
            {userInputs.map((input, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Username"
                  className="border px-2 py-1 flex-1"
                  value={input.username}
                  onChange={(e) => handleUserChange(index, 'username', e.target.value)}
                />
                <select
                  value={input.role}
                  onChange={(e) => handleUserChange(index, 'role', e.target.value as DocumentRole)}
                  className="border px-2 py-1"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeUserInput(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addUserInput}
              className="text-blue-600 hover:underline text-sm"
            >
              + Add User
            </button>
          </div>

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
          {documents.map(({ document, role }) => (
            <li
              key={document.id}
              className="p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <Link
                  to={`/document/${document.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {document.name || '(No Name)'}
                </Link>
                <span className="text-sm text-gray-500">({role})</span>
              </div>
              <button
                onClick={() => handleDeleteDocument(document.id)}
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
