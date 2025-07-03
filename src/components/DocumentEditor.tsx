import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { hubConnection, sendMessage } from '../api/signalr';
import { getBlocksByDocument } from '../api/block';
import { Block } from '../models/block';
import { useDebouncedCallback } from 'use-debounce';

export const DocumentEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const load = async () => {
      if (documentId) {
        const from = new Date(0).toISOString();
        const fetched = await getBlocksByDocument(parseInt(documentId), from);
        setBlocks(fetched);
      }
    };

    load();

    hubConnection.on('ReceiveBlock', (block: Block) => {
      setBlocks((prev) => [...prev, block]);
    });

    hubConnection.on('BlockEdited', (block: Block) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === block.id ? block : b))
      );
    });

    return () => {
      hubConnection.off('ReceiveBlock');
      hubConnection.off('BlockEdited');
    };
  }, [documentId]);

  const createBlock = async () => {
    if (!documentId) return;
    await sendMessage('SendBlock', [{
      text: '',
      documentId: parseInt(documentId),
    }]);
  };

  const debouncedUpdate = useDebouncedCallback((id: number, text: string) => {
    sendMessage('EditBlock', [{ id, editedText: text }]);
  }, 1000);

  const handleChange = (id: number, value: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text: value } : b))
    );
    debouncedUpdate(id, value);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Document Editor</h2>

      <div className="space-y-3">
        {blocks.map((block) => (
          <textarea
            key={block.id}
            value={block.text}
            onChange={(e) => handleChange(block.id, e.target.value)}
            className="w-full border rounded p-2"
            rows={3}
            placeholder="Start writing..."
          />
        ))}
      </div>

      <button
        onClick={createBlock}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Add Block
      </button>
    </div>
  );
};
