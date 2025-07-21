import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { hubConnection, sendMessage } from '../api/signalr';
import { getBlocksByDocument } from '../api/block';
import { getMyDocuments } from '../api/document';
import { RichTextBlockEditor } from './RichTextBlockEditor';
import { EditorToolbar } from './EditorToolbar';
import { Block } from '../models/block';
import { DocumentRole } from '../models/document';
import { Editor } from '@tiptap/react';

export const DocumentEditor: React.FC = () => {
  const baseUrl = 'http://localhost:9000';
  const { documentId } = useParams<{ documentId: string }>();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [role, setRole] = useState<DocumentRole | null>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const activeBlockIdRef = useRef<number | null>(null);
  const canEdit = role === 'Creator' || role === 'Editor';
  const editorRefs = useRef<Record<number, Editor>>({});

  const save = useDebouncedCallback((id: number, json: any) => {
    console.log('Saving block:', id, json); // Отладка
    sendMessage('EditBlock', [
      {
        id,
        editedText: JSON.stringify(json),
      },
    ]);
  }, 200);

  useEffect(() => {
    if (!documentId) return;

    (async () => {
      try {
        const fetched = await getBlocksByDocument(Number(documentId), new Date(0).toISOString());
        const docs = await getMyDocuments();
        console.log('Fetched blocks:', fetched); // Отладка
        console.log('Fetched docs:', docs); // Отладка
        setBlocks(fetched);
        setRole(docs.find(d => d.document.id === Number(documentId))?.role ?? null);
      } catch (error) {
        console.error('Error fetching blocks or documents:', error);
      }
    })();

    hubConnection.on('ReceiveBlock', (newBlock: Block) => {
      console.log('Received new block:', newBlock); // Отладка
      setBlocks(prev => [...prev, newBlock]);
    });

    hubConnection.on('BlockEdited', (b: Block) => {
      console.log('Block edited:', b); // Отладка
      setBlocks(prev => prev.map(p => (p.id === b.id ? b : p)));
    });

    return () => {
      hubConnection.off('ReceiveBlock');
      hubConnection.off('BlockEdited');
    };
  }, [documentId]);

  useEffect(() => {
    if (canEdit && blocks.length > 0 && !activeEditor && Object.keys(editorRefs.current).length > 0) {
      const firstBlockId = blocks[0].id;
      if (editorRefs.current[firstBlockId]) {
        console.log('Setting active editor for first block:', firstBlockId); // Отладка
        setActiveEditor(editorRefs.current[firstBlockId]);
        activeBlockIdRef.current = firstBlockId;
      }
    }
  }, [blocks, canEdit, activeEditor]);

  const getFileUrl = (filePath: string): string => {
    const normalizedPath = filePath.replace(/^\/+/, '');
    return `${baseUrl}/${normalizedPath}`;
  };

  const handleBlockChange = (id: number, json: any) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, text: JSON.stringify(json) } : b)));
    save(id, json);
  };

  const handleImagePaste = async (
    blockId: number,
    file: File,
    insertAtCursor: (url: string) => void
  ) => {
    if (hubConnection.state !== 'Connected') {
      alert('Подключение не активно. Попробуйте позже.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const fileUpload = {
        fileName: file.name,
        contentType: file.type,
        contentBase64: base64,
      };

      const request = {
        blockId,
        url: '',
        uploadedOn: new Date().toISOString(),
        userId: 0,
      };

      const blockImage = await sendMessage('SendBlockImage', [request, fileUpload]);
      const imageUrl = getFileUrl(blockImage.url);
      insertAtCursor(imageUrl);
    } catch (error) {
      console.error('❌ Ошибка при вставке изображения:', error);
      alert('Ошибка при загрузке изображения.');
    }
  };

  const handleAddBlock = () => {
    if (!documentId) return;
    console.log('Adding new block for document:', documentId); // Отладка
    sendMessage('SendBlock', [{ text: '{}', documentId: Number(documentId) }]);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      <main className="mx-auto w-[794px] p-8 flex flex-col space-y-1 bg-white">
        {canEdit && activeEditor && (
          <EditorToolbar editor={activeEditor} onAddBlock={handleAddBlock} />
        )}
        {blocks.length === 0 && canEdit && (
          <div className="text-center text-gray-500 py-4">Нет блоков для редактирования</div>
        )}
        {blocks.map(block => {
          let content: any = {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [],
              },
            ],
          };

          try {
            const parsed = JSON.parse(block.text || '{}');
            if (parsed?.type === 'doc') {
              content = parsed;
            }
          } catch (e) {
            console.warn('Невалидный JSON в блоке', block.id, e);
          }

          return (
            <div key={block.id} className="border p-2 rounded-sm">
              <RichTextBlockEditor
                content={content}
                editable={canEdit}
                onFocus={() => {
                  console.log('Block focused:', block.id); // Отладка
                  activeBlockIdRef.current = block.id;
                  if (editorRefs.current[block.id]) {
                    setActiveEditor(editorRefs.current[block.id]);
                  }
                }}
                onEditorReady={(editor) => {
                  console.log('Editor ready for block:', block.id); // Отладка
                  editorRefs.current[block.id] = editor;
                  if (!activeEditor && blocks[0]?.id === block.id && canEdit) {
                    setActiveEditor(editor);
                    activeBlockIdRef.current = block.id;
                  }
                }}
                onChange={json => handleBlockChange(block.id, json)}
                onImagePaste={(file, insertAtCursor) =>
                  handleImagePaste(block.id, file, insertAtCursor)
                }
              />
            </div>
          );
        })}
      </main>
    </div>
  );
};