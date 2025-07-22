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
import { FontSize } from '../extensions/FontSize'; // убедись, что путь верный
import { FontFamily } from '../extensions/FontFamily';
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
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
      TextStyle, // обязательно
      FontFamily,  // обязательно
      FontSize,
      Color,
      Highlight.configure({
      multicolor: true,  // включаем поддержку разных цветов подсветки
      // можно не задавать цвет по умолчанию, чтобы убрать желтый фон
    }),
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
    editable,
    content,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    onFocus: () => onFocus?.(),
    onCreate: () => console.log('Editor created'),
  });

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
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
    <div className="prose min-h-[100px] w-full p-2 border border-gray-300 rounded-sm bg-white outline-none whitespace-pre-wrap break-words focus:ring-2 focus:ring-blue-400 hover:bg-gray-50 transition-all">
      <EditorContent editor={editor} spellCheck={false} />
    </div>
  );
};
