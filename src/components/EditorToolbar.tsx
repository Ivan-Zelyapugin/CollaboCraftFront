import React from 'react';
import { Editor } from '@tiptap/react';
import { Level } from '@tiptap/extension-heading';

interface EditorToolbarProps {
  editor: Editor;
  onAddBlock: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onAddBlock }) => {
  if (!editor) return null;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md border-b p-2">
      <div className="max-w-[794px] mx-auto flex items-center gap-2 flex-wrap">
        {/* Кнопка добавления блока */}
        <button
          onClick={() => {
            console.log('Add block clicked'); // Отладка
            onAddBlock();
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          ➕ Блок
        </button>

        {/* Заголовки */}
        <select
          className="border px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
            editor.isActive('heading', { level: 2 }) ? 'h2' :
            editor.isActive('heading', { level: 3 }) ? 'h3' :
            editor.isActive('heading', { level: 4 }) ? 'h4' :
            editor.isActive('heading', { level: 5 }) ? 'h5' :
            editor.isActive('heading', { level: 6 }) ? 'h6' :
            'paragraph'
          }
          onChange={(e) => {
            const value = e.target.value;
            console.log('Heading selected:', value); // Отладка
            const chain = editor.chain().focus();
            if (value === 'paragraph') {
              chain.setNode('paragraph').run();
            } else {
              const level = parseInt(value[1], 10) as Level;
              chain.toggleHeading({ level }).run();
            }
          }}
        >
          <option value="paragraph">Параграф</option>
          <option value="h1">Заголовок 1</option>
          <option value="h2">Заголовок 2</option>
          <option value="h3">Заголовок 3</option>
          <option value="h4">Заголовок 4</option>
          <option value="h5">Заголовок 5</option>
          <option value="h6">Заголовок 6</option>
        </select>

        {/* Bold */}
        <button
          onClick={() => {
            console.log('Toggle bold'); // Отладка
            editor.chain().focus().toggleBold().run();
          }}
          className={`px-3 py-1 rounded border ${editor.isActive('bold') ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
        >
          <b>B</b>
        </button>

        {/* Italic */}
        <button
          onClick={() => {
            console.log('Toggle italic'); // Отладка
            editor.chain().focus().toggleItalic().run();
          }}
          className={`px-3 py-1 rounded border ${editor.isActive('italic') ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
        >
          <i>I</i>
        </button>

        {/* Strike */}
        <button
          onClick={() => {
            console.log('Toggle strike'); // Отладка
            editor.chain().focus().toggleStrike().run();
          }}
          className={`px-3 py-1 rounded border ${editor.isActive('strike') ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
        >
          <s>S</s>
        </button>

        {/* Маркированный список */}
        <button
          onClick={() => {
            console.log('Toggle bullet list'); // Отладка
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`px-3 py-1 rounded border ${editor.isActive('bulletList') ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
        >
          • Список
        </button>

        {/* Нумерованный список */}
        <button
          onClick={() => {
            console.log('Toggle ordered list'); // Отладка
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`px-3 py-1 rounded border ${editor.isActive('orderedList') ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
        >
          1. Список
        </button>

        {/* Выравнивание */}
        <button
          onClick={() => {
            console.log('Set text align left'); // Отладка
            editor.chain().focus().setTextAlign('left').run();
          }}
          className={`px-3 py-1 rounded border ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
        >
          ⬅️
        </button>
        <button
          onClick={() => {
            console.log('Set text align center'); // Отладка
            editor.chain().focus().setTextAlign('center').run();
          }}
          className={`px-3 py-1 rounded border ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
        >
          ⬅️➡️
        </button>
        <button
          onClick={() => {
            console.log('Set text align right'); // Отладка
            editor.chain().focus().setTextAlign('right').run();
          }}
          className={`px-3 py-1 rounded border ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
        >
          ➡️
        </button>
      </div>
    </div>
  );
};