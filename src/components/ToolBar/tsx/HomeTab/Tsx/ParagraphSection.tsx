import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { FaAlignLeft, FaAlignRight, FaAlignCenter, FaAlignJustify, FaListUl, FaListOl } from 'react-icons/fa';
import { bulletListStyles, orderedListStyles } from '../../../Ts/constants';
import { EditorAttributes, BulletListStyle, OrderedListStyle } from '../Ts/types';

interface ParagraphSectionProps {
  editor: Editor;
  currentAttributes: EditorAttributes;
  setCurrentAttributes?: (attributes: EditorAttributes) => void;
  bulletListDropdownRef: React.RefObject<HTMLDivElement>;
  orderedListDropdownRef: React.RefObject<HTMLDivElement>;
  setBulletListDropdownOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setOrderedListDropdownOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ParagraphSection: React.FC<ParagraphSectionProps> = ({
  editor,
  currentAttributes,
  setCurrentAttributes,
  bulletListDropdownRef,
  orderedListDropdownRef,
  setBulletListDropdownOpen,
  setOrderedListDropdownOpen,
}) => {
  const [bulletListDropdownOpen, setBulletListDropdownOpenLocal] = useState(false);
  const [orderedListDropdownOpen, setOrderedListDropdownOpenLocal] = useState(false);

  const currentTextAlign = currentAttributes.textAlign || 'left';

  const updateAttributes = (updates: Partial<EditorAttributes>) => {
    if (setCurrentAttributes) {
      setCurrentAttributes({
        ...currentAttributes,
        ...updates,
      });
    }
  };

  const setTextAlign = (align: 'left' | 'right' | 'center' | 'justify') => {
    editor.chain().focus().setTextAlign(align).run();
    updateAttributes({ textAlign: align });
  };

  const setBulletList = (style: string) => {
    editor.chain().focus().toggleBulletList().run();
    if (editor.isActive('bulletList')) {
      editor.commands.setNode('bulletList', { listStyleType: style });
    }
    setBulletListDropdownOpenLocal(false);
    setBulletListDropdownOpen?.(false);
    updateAttributes({ bulletList: editor.isActive('bulletList') });
  };

  const setOrderedList = (level: number) => {
    editor.chain().focus().toggleOrderedList().run();
    if (editor.isActive('orderedList')) {
      const style = level === 1 ? 'decimal' : level === 2 ? 'decimal' : 'decimal';
      editor.commands.setNode('orderedList', { 'data-level': level, listStyleType: style });
    }
    setOrderedListDropdownOpenLocal(false);
    setOrderedListDropdownOpen?.(false);
    updateAttributes({ orderedList: editor.isActive('orderedList') });
  };

  return (
    <div className="flex flex-col max-w-max">
      <span className="text-sm font-semibold text-gray-500 mb-1">Абзац</span>
      <div className="flex gap-2 flex-wrap items-center">
        <button
          type="button"
          onClick={() => setTextAlign('left')}
          className={`p-2 rounded ${currentTextAlign === 'left' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Выровнять по левому краю"
        >
          <FaAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => setTextAlign('center')}
          className={`p-2 rounded ${currentTextAlign === 'center' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Выровнять по центру"
        >
          <FaAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => setTextAlign('right')}
          className={`p-2 rounded ${currentTextAlign === 'right' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Выровнять по правому краю"
        >
          <FaAlignRight />
        </button>
        <button
          type="button"
          onClick={() => setTextAlign('justify')}
          className={`p-2 rounded ${currentTextAlign === 'justify' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Выровнять по ширине"
        >
          <FaAlignJustify />
        </button>
        <div className="relative" ref={bulletListDropdownRef}>
          <button
            type="button"
            className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => {
              setBulletListDropdownOpenLocal((prev) => !prev);
              setBulletListDropdownOpen?.((prev) => !prev);
            }}
            title="Маркированный список"
          >
            <FaListUl />
          </button>
          {bulletListDropdownOpen && (
            <div className="absolute z-50 bg-white border rounded shadow mt-1 w-40">
              {bulletListStyles.map((style: BulletListStyle) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setBulletList(style.value)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {style.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative" ref={orderedListDropdownRef}>
          <button
            type="button"
            className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
            onClick={() => {
              setOrderedListDropdownOpenLocal((prev) => !prev);
              setOrderedListDropdownOpen?.((prev) => !prev);
            }}
            title="Нумерованный список"
          >
            <FaListOl />
          </button>
          {orderedListDropdownOpen && (
            <div className="absolute z-50 bg-white border rounded shadow mt-1 w-40">
              {orderedListStyles.map((style: OrderedListStyle) => (
                <button
                  key={style.level}
                  type="button"
                  onClick={() => setOrderedList(style.level)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {style.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};