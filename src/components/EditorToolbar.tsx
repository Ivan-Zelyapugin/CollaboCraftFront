import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { FileTab } from './ToolBar/tsx/FileTab';
import { HomeTab } from './ToolBar/tsx/HomeTab';
import { InsertTab } from './ToolBar/tsx/InsertTab';
import { LayoutTab } from './ToolBar/tsx/LayoutTab';
import { EditorAttributes } from './ToolBar/tsx/HomeTab/Ts/types';

interface EditorToolbarProps {
  editor: Editor;
  onAddBlock: () => void;
  currentAttributes: EditorAttributes;
  setCurrentAttributes?: (attributes: EditorAttributes) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onAddBlock, currentAttributes, setCurrentAttributes }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'home' | 'insert' | 'layout'>('home');
  const [showFileMenu, setShowFileMenu] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const caseDropdownRef = useRef<HTMLDivElement>(null);
  const bulletListDropdownRef = useRef<HTMLDivElement>(null);
  const orderedListDropdownRef = useRef<HTMLDivElement>(null);
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightColorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        caseDropdownRef.current &&
        !caseDropdownRef.current.contains(event.target as Node) &&
        bulletListDropdownRef.current &&
        !bulletListDropdownRef.current.contains(event.target as Node) &&
        orderedListDropdownRef.current &&
        !orderedListDropdownRef.current.contains(event.target as Node) &&
        textColorRef.current &&
        !textColorRef.current.contains(event.target as Node) &&
        highlightColorRef.current &&
        !highlightColorRef.current.contains(event.target as Node)
      ) {
        setShowFileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef, caseDropdownRef, bulletListDropdownRef, orderedListDropdownRef, textColorRef, highlightColorRef]);

  if (!editor) return null;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md border-b px-4 py-2 w-full">
      <div className="flex border-b mb-2">
        {(['file', 'home', 'insert', 'layout'] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => {
              setActiveTab(tab);
              setShowFileMenu(false);
            }}
            type="button"
          >
            {tab === 'file' ? 'Файл' : tab === 'home' ? 'Главная' : tab === 'insert' ? 'Вставка' : 'Макет'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 relative">
        {activeTab === 'file' && <FileTab showFileMenu={showFileMenu} setShowFileMenu={setShowFileMenu} />}
        {activeTab === 'home' && (
          <HomeTab
            editor={editor}
            onAddBlock={onAddBlock}
            currentAttributes={currentAttributes}
            setCurrentAttributes={setCurrentAttributes}
            dropdownRef={dropdownRef}
            caseDropdownRef={caseDropdownRef}
            bulletListDropdownRef={bulletListDropdownRef}
            orderedListDropdownRef={orderedListDropdownRef}
            textColorRef={textColorRef}
            highlightColorRef={highlightColorRef}
          />
        )}
        {activeTab === 'insert' && <InsertTab editor={editor} />}
        {activeTab === 'layout' && <LayoutTab />}
      </div>
    </div>
  );
};