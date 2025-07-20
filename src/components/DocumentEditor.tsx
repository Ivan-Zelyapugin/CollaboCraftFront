import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { hubConnection, sendMessage } from '../api/signalr';
import { getBlocksByDocument } from '../api/block';
import { getMyDocuments } from '../api/document';
import { RichTextBlockEditor } from './RichTextBlockEditor';
import { Block } from '../models/block';
import { DocumentRole } from '../models/document';

export const DocumentEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [role, setRole] = useState<DocumentRole | null>(null);
  const activeBlockIdRef = useRef<number | null>(null);

  const canEdit = role === 'Creator' || role === 'Editor';

  const save = useDebouncedCallback((id: number, text: string) => {
    sendMessage('EditBlock', [{ id, editedText: text }]);
  }, 1000);

  useEffect(() => {
    if (!documentId) return;

    (async () => {
      const fetched = await getBlocksByDocument(Number(documentId), new Date(0).toISOString());
      setBlocks(fetched);

      const docs = await getMyDocuments();
      setRole(docs.find(d => d.document.id === Number(documentId))?.role ?? null);
    })();

    const handleReceiveBlock = (b: Block) => {
      setBlocks(prev => {
        const activeId = activeBlockIdRef.current;
        if (activeId != null) {
          const index = prev.findIndex(block => block.id === activeId);
          if (index !== -1) {
            return [...prev.slice(0, index + 1), b, ...prev.slice(index + 1)];
          }
        }
        return [...prev, b];
      });
    };

    hubConnection.on('ReceiveBlock', handleReceiveBlock);
    hubConnection.on('BlockEdited', (b: Block) => {
      setBlocks(prev => prev.map(p => (p.id === b.id ? b : p)));
    });

    return () => {
      hubConnection.off('ReceiveBlock', handleReceiveBlock);
      hubConnection.off('BlockEdited');
    };
  }, [documentId]);

  const handleBlockChange = (id: number, text: string) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, text } : b)));
    save(id, text);
  };

  const handleImagePaste = async (
  blockId: number,
  file: File,
  insertAtCursor: (marker: string) => void
) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const contentBytes = new Uint8Array(arrayBuffer);

    const fileUpload = {
      fileName: file.name,
      contentType: file.type,
      content: Array.from(contentBytes), // важно! не base64, а массив чисел
    };

    const request = {
      blockId,
      url: "", // можно оставить пустым или null, если сервер потом установит
      uploadedOn: new Date().toISOString(),
      userId: 0, // сервер должен перезаписать
    };

    const response = await sendMessage('SendBlockImage', [request, fileUpload]);

    const imageId = response.id;
    const marker = `[image:${imageId}]`;
    insertAtCursor(marker);

    // Обновляем текст блока, чтобы сохранить маркер
    const updated = blocks.find(b => b.id === blockId)?.text ?? '';
    save(blockId, updated + `\n${marker}`);
  } catch (error) {
    console.error('❌ Ошибка при вставке изображения:', error);
  }
};


  const handleAddBlock = () => {
    if (!documentId) return;
    sendMessage('SendBlock', [{ text: '', documentId: Number(documentId) }]);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {canEdit && (
        <div className="fixed top-4 left-4 z-10">
          <button
            onClick={handleAddBlock}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            ➕ Блок
          </button>
        </div>
      )}

      <main className="mx-auto w-[794px] p-8 flex flex-col space-y-1 bg-white">
        {blocks.map(block => (
          <RichTextBlockEditor
            key={block.id}
            text={block.text}
            editable={canEdit}
            onFocus={() => { activeBlockIdRef.current = block.id; }}
            onChange={text => handleBlockChange(block.id, text)}
            onImagePaste={(file, insertAtCursor) =>
              handleImagePaste(block.id, file, insertAtCursor)
            }
          />
        ))}
      </main>
    </div>
  );
};
