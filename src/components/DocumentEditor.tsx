import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { hubConnection, sendMessage } from '../api/signalr';
import { getBlocksByDocument } from '../api/block';
import { getMyDocuments } from '../api/document';
import { RichTextBlockEditor } from './RichTextBlockEditor';
import { Block } from '../models/block';
import { DocumentRole } from '../models/document';

const PAGE_HEIGHT = 1123;

export const DocumentEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [block, setBlock] = useState<Block | null>(null);
  const [role, setRole] = useState<DocumentRole | null>(null);

  const canEdit = role === 'Creator' || role === 'Editor';

  const debouncedUpdate = useDebouncedCallback((id: number, text: string) => {
    sendMessage('EditBlock', [{ id, editedText: text }]);
  }, 1000);

  useEffect(() => {
    if (!documentId) return;

    const fetchData = async () => {
      const fetchedBlocks = await getBlocksByDocument(Number(documentId), new Date(0).toISOString());

      if (fetchedBlocks.length > 0) {
        setBlock(fetchedBlocks[0]);
      } else {
        await sendMessage('SendBlock', [{
          text: '',
          documentId: Number(documentId),
        }]);
      }

      const documents = await getMyDocuments();
      const currentDoc = documents.find((d) => d.document.id === Number(documentId));
      setRole(currentDoc?.role ?? null);
    };

    fetchData();

    hubConnection.on('ReceiveBlock', (b: Block) => setBlock(b));
    hubConnection.on('BlockEdited', (b: Block) => setBlock(b));

    return () => {
      hubConnection.off('ReceiveBlock');
      hubConnection.off('BlockEdited');
    };
  }, [documentId]);

  // Разделение текста по страницам
  const getPages = (text: string): string[] => {
    const lines = text.split('\n');
    const approxLinesPerPage = 40; // примерная оценка, зависит от шрифта

    const pages: string[] = [];
    for (let i = 0; i < lines.length; i += approxLinesPerPage) {
      pages.push(lines.slice(i, i + approxLinesPerPage).join('\n'));
    }
    return pages.length ? pages : [''];
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 py-4 px-6 overflow-y-auto bg-gray-300 flex flex-col items-center">
        {block &&
          getPages(block.text).map((pageText, index) => (
            <div
              key={index}
              className="page"
              style={{ position: 'relative' }}
            >
              <RichTextBlockEditor
                text={pageText}
                editable={canEdit}
                onChange={(updatedPageText) => {
                  const pages = getPages(block.text);
                  pages[index] = updatedPageText;
                  const newText = pages.join('\n');
                  setBlock({ ...block, text: newText });
                  debouncedUpdate(block.id, newText);
                }}
              />
            </div>
          ))}
      </main>
    </div>
  );
};
