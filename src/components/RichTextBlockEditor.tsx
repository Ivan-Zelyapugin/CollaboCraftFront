import React, { useEffect } from 'react';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Heading from '@tiptap/extension-heading';

interface Props {
  content: any;
  editable: boolean;
  onFocus?: () => void;
  onEditorReady?: (editor: Editor) => void;
  onChange: (json: any) => void;
  onImagePaste?: (file: File, insertAtCursor: (url: string) => void) => void;
}

export const RichTextBlockEditor: React.FC<Props> = ({
  content,
  editable,
  onFocus,
  onChange,
  onImagePaste,
  onEditorReady,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
        bulletList: false,
        orderedList: false,
        heading: false,
      }),
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph', 'listItem'] }), // Добавляем listItem
      Image,
      BulletList.configure({
        HTMLAttributes: { class: 'list-disc pl-6' },
      }),
      OrderedList.configure({
        HTMLAttributes: { class: 'list-decimal pl-6' },
      }),
      ListItem,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: { class: 'font-bold' },
      }),
    ],
    editable,
    content,
    onUpdate: ({ editor }) => {
      console.log('Editor updated:', editor.getJSON()); // Отладка
      onChange(editor.getJSON());
    },
    onFocus: () => {
      console.log('Editor focused'); // Отладка
      onFocus?.();
    },
    onCreate: () => console.log('Editor created'), // Отладка
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      console.log('Editor initialized:', editor); // Отладка
      onEditorReady(editor);
    } else if (!editor) {
      console.log('Editor failed to initialize'); // Отладка
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor || !onImagePaste) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            onImagePaste(file, (url: string) => {
              editor.chain().focus().setImage({ src: url }).run();
            });
          }
        }
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener('paste', handlePaste);
    return () => dom.removeEventListener('paste', handlePaste);
  }, [editor, onImagePaste]);

  if (!editor) return <div className="text-red-500">Редактор не инициализирован</div>;

  return (
    <div>
      <EditorContent
        editor={editor}
        className="min-h-[100px] w-full p-2 border border-gray-300 rounded-sm bg-white
                   outline-none whitespace-pre-wrap break-words
                   focus:ring-2 focus:ring-blue-400
                   hover:bg-gray-50 transition-all"
        spellCheck={false}
      />
    </div>
  );
};