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
import { Editor, useEditor } from '@tiptap/react';
import { FontFamily } from '../extensions/FontFamily';
import { FontSize } from '../extensions/FontSize';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { EditorAttributes } from './ToolBar/tsx/HomeTab/Ts/types';

export const DocumentEditor: React.FC = () => {
  const baseUrl = 'http://localhost:9000';
  const { documentId } = useParams<{ documentId: string }>();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [role, setRole] = useState<DocumentRole | null>(null);
  const [currentAttributes, setCurrentAttributes] = useState<EditorAttributes>({});
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const editorRefs = useRef<Record<number, Editor>>({});

  const fallbackEditor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
        bulletList: false,
        orderedList: false,
        heading: false,
      }),
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'listItem'] }),
      Image,
      BulletList.configure({ HTMLAttributes: { class: 'list-disc pl-6' } }),
      OrderedList.configure({ HTMLAttributes: { class: 'list-decimal pl-6' } }),
      ListItem,
      Underline,
      Subscript,
      Superscript,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    ],
    content: '<p></p>',
    editable: role === 'Creator' || role === 'Editor',
    onUpdate: ({ editor }) => {
      setCurrentAttributes({
        fontFamily: editor.getAttributes('textStyle')?.fontFamily || 'Times New Roman',
        fontSize: editor.getAttributes('textStyle')?.fontSize || 14,
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        strike: editor.isActive('strike'),
        superscript: editor.isActive('superscript'),
        subscript: editor.isActive('subscript'),
        color: editor.getAttributes('textStyle')?.color || '#000000',
        highlight: editor.getAttributes('highlight')?.color || null,
        textAlign: editor.getAttributes('paragraph')?.textAlign || 'left',
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
      });
    },
  });

  useEffect(() => {
    if (fallbackEditor) {
      fallbackEditor.setEditable(role === 'Creator' || role === 'Editor');
    }
  }, [fallbackEditor, role]);

  const save = useDebouncedCallback((id: number, json: any) => {
    console.log('Saving block:', id, json);
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
        console.log('Fetched blocks:', fetched);
        console.log('Fetched docs:', docs);
        setBlocks(fetched);
        setRole(docs.find(d => d.document.id === Number(documentId))?.role ?? null);
      } catch (error) {
        console.error('Error fetching blocks or documents:', error);
      }
    })();

    hubConnection.on('ReceiveBlock', (newBlock: Block) => {
      console.log('Received new block:', newBlock);
      setBlocks(prev => [...prev, newBlock]);
    });

    hubConnection.on('BlockEdited', (b: Block) => {
      console.log('Block edited:', b);
      setBlocks(prev => prev.map(p => (p.id === b.id ? b : p)));
    });

    hubConnection.on('ReceiveBlockImage', (blockImage: { id: number; url: string }) => {
      console.log('Received block image:', blockImage);
      const editor = editorRefs.current[blockImage.id] || activeEditor || fallbackEditor;
      if (editor) {
        editor.chain().focus().setImage({ src: `${baseUrl}/${blockImage.url}` }).run();
      }
    });

    return () => {
      hubConnection.off('ReceiveBlock');
      hubConnection.off('BlockEdited');
      hubConnection.off('ReceiveBlockImage');
    };
  }, [documentId, baseUrl, activeEditor, fallbackEditor]);

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

      await sendMessage('SendBlockImage', [request, fileUpload]);
    } catch (error) {
      console.error('❌ Ошибка при вставке изображения:', error);
      alert('Ошибка при загрузке изображения.');
    }
  };

  const handleAddBlock = () => {
    if (!documentId) return;
    console.log('Adding new block for document:', documentId);
    sendMessage('SendBlock', [{ text: '{}', documentId: Number(documentId) }]);
  };

  // Показываем тулбар только если есть валидный редактор
  if (!activeEditor && !fallbackEditor) {
    return (
      <div className="min-h-screen bg-gray-100 w-full">
        <div className="text-center text-gray-500 py-4">Редактор загружается...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <EditorToolbar
        editor={activeEditor || (fallbackEditor as Editor)}
        onAddBlock={handleAddBlock}
        currentAttributes={currentAttributes}
        setCurrentAttributes={setCurrentAttributes}
      />
      <div className="flex w-full">
        <main className="mx-auto w-[794px] p-8 flex flex-col space-y-1 bg-white">
          {blocks.length === 0 && (
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
              <div key={block.id} >
                <RichTextBlockEditor
                  content={content}
                  editable={role === 'Creator' || role === 'Editor'}
                  onFocus={() => {
                    console.log('Block focused:', block.id);
                    if (editorRefs.current[block.id]) {
                      setActiveEditor(editorRefs.current[block.id]);
                      setCurrentAttributes({
                        fontFamily: editorRefs.current[block.id].getAttributes('textStyle')?.fontFamily || 'Times New Roman',
                        fontSize: editorRefs.current[block.id].getAttributes('textStyle')?.fontSize || 14,
                        bold: editorRefs.current[block.id].isActive('bold'),
                        italic: editorRefs.current[block.id].isActive('italic'),
                        underline: editorRefs.current[block.id].isActive('underline'),
                        strike: editorRefs.current[block.id].isActive('strike'),
                        superscript: editorRefs.current[block.id].isActive('superscript'),
                        subscript: editorRefs.current[block.id].isActive('subscript'),
                        color: editorRefs.current[block.id].getAttributes('textStyle')?.color || '#000000',
                        highlight: editorRefs.current[block.id].getAttributes('highlight')?.color || null,
                        textAlign: editorRefs.current[block.id].getAttributes('paragraph')?.textAlign || 'left',
                        bulletList: editorRefs.current[block.id].isActive('bulletList'),
                        orderedList: editorRefs.current[block.id].isActive('orderedList'),
                      });
                    }
                  }}
                  onEditorReady={(editor) => {
                    console.log('Editor ready for block:', block.id);
                    editorRefs.current[block.id] = editor;
                    if (!activeEditor && blocks[0]?.id === block.id) {
                      setActiveEditor(editor);
                    }
                  }}
                  onChange={json => handleBlockChange(block.id, json)}
                  onImagePaste={(file, insertAtCursor) =>
                    handleImagePaste(block.id, file, insertAtCursor)
                  }
                  onSelectionUpdate={setCurrentAttributes}
                />
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
};