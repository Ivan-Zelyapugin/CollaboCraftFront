import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { 
  FaPlus, FaMinus, FaTrash, FaBold, FaItalic, FaStrikethrough, FaUnderline, 
  FaSuperscript, FaSubscript, FaFont, FaFillDrip 
} from 'react-icons/fa';

interface EditorToolbarProps {
  editor: Editor;
  onAddBlock: () => void;
}

const fontOptions = [
  'Arial', 'Arial Black', 'Brush Script MT', 'Calibri', 'Cambria', 'Candara', 'Comic Sans MS', 'Consolas',
  'Constantia', 'Corbel', 'Courier New', 'Franklin Gothic Medium', 'Garamond', 'Georgia', 'Gill Sans',
  'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode', 'Optima', 'Palatino Linotype', 'Segoe Print',
  'Segoe Script', 'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
];

// Палитра: 10 базовых цветов, 5 оттенков каждый (примерно как в Word)
const colorPalette = [
  ['#000000', '#404040', '#808080', '#BFBFBF', '#FFFFFF'],
  ['#7F0E0E', '#B22222', '#E57373', '#F8BBD0', '#FFEBEE'],
  ['#7F3F00', '#D2691E', '#FFB74D', '#FFE0B2', '#FFF3E0'],
  ['#7F6A00', '#DAA520', '#FFD54F', '#FFF9C4', '#FFFDE7'],
  ['#2E7D32', '#4CAF50', '#81C784', '#C8E6C9', '#F1F8E9'],
  ['#00695C', '#26A69A', '#4DB6AC', '#B2DFDB', '#E0F2F1'],
  ['#01579B', '#2196F3', '#64B5F6', '#BBDEFB', '#E3F2FD'],
  ['#1A237E', '#3F51B5', '#7986CB', '#C5CAE9', '#E8EAF6'],
  ['#4A148C', '#9C27B0', '#BA68C8', '#E1BEE7', '#F3E5F5'],
  ['#880E4F', '#E91E63', '#F06292', '#F9C1D9', '#FCE4EC'],
];

const ColorPicker: React.FC<{ onSelect: (color: string) => void }> = ({ onSelect }) => (
  <div className="grid grid-cols-5 gap-1 p-2 bg-white shadow-md rounded border max-w-[220px]">
    {colorPalette.flat().map(color => (
      <button
        key={color}
        type="button"
        title={color}
        className="w-6 h-6 rounded"
        style={{ backgroundColor: color }}
        onClick={() => onSelect(color)}
      />
    ))}
  </div>
);

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onAddBlock }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'home' | 'insert' | 'layout'>('home');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentFonts, setRecentFonts] = useState<string[]>([]);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightColorRef = useRef<HTMLDivElement>(null);

  // Получение текущего цвета фона подсветки
  const highlightAttr = editor.getAttributes('highlight');
  const bgColor = highlightAttr.color || '#fff';

  // Получение текущего шрифта
  const currentFont = (editor.getAttributes('textStyle') as any).fontFamily || 'Times New Roman';

  // Закрытие дропдаунов при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        textColorRef.current && !textColorRef.current.contains(event.target as Node) &&
        highlightColorRef.current && !highlightColorRef.current.contains(event.target as Node)
      ) {
        setFontDropdownOpen(false);
        setSearchTerm('');
        setShowTextColorPicker(false);
        setShowHighlightColorPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSelectFont = (font: string) => {
    editor.chain().focus().setFontFamily(font).run();
    setFontDropdownOpen(false);
    setSearchTerm('');
    setRecentFonts(prev => {
      const newList = [font, ...prev.filter(f => f !== font)];
      return newList.slice(0, 5);
    });
  };

  // Фильтрация шрифтов по поиску
  const filteredFonts = fontOptions
    .sort((a, b) => a.localeCompare(b))
    .filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!editor) return null;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md border-b px-4 py-2 w-full">
      {/* Вкладки */}
      <div className="flex border-b mb-2">
        {(['file', 'home', 'insert', 'layout'] as const).map(tab => (
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
        {/* Вкладка Файл */}
        {activeTab === 'file' && (
          <div>
            <button
              type="button"
              className="bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200"
              onClick={() => setShowFileMenu(prev => !prev)}
            >
              📁 Меню файла
            </button>
            {showFileMenu && (
              <div className="absolute mt-2 bg-white border rounded shadow z-50 w-48">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Export document');
                    setShowFileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  📤 Экспортировать
                </button>
              </div>
            )}
          </div>
        )}

        {/* Вкладка Главная */}
        {activeTab === 'home' && (
  <>
    {/* Управление блоками */}
    <div className="flex flex-col border-r pr-4 min-w-[140px]">
      <span className="text-sm font-semibold text-gray-500 mb-1">Блоки</span>
      <button
        type="button"
        onClick={onAddBlock}
        className="bg-blue-600 text-white px-3 py-1 mb-2 rounded hover:bg-blue-700 flex items-center gap-2"
      >
        <FaPlus /> Добавить
      </button>
      <button
        type="button"
        disabled
        className="bg-gray-300 text-white px-3 py-1 rounded cursor-not-allowed flex items-center gap-2"
      >
        <FaTrash /> Удалить
      </button>
    </div>

    {/* Отдел шрифта — две строки */}
    <div className="flex flex-col ml-4 max-w-max">
      <span className="text-sm font-semibold text-gray-500 mb-1">Шрифт</span>
      {/* Первая строка: шрифт, размер и +/- */}
      <div className="flex gap-4 mb-2 items-center flex-wrap">
        {/* Шрифт */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <button
            type="button"
            className="w-full border px-3 py-1 rounded bg-white text-left cursor-pointer"
            onClick={() => setFontDropdownOpen(open => !open)}
            style={{ fontFamily: currentFont }}
          >
            {currentFont}
          </button>

          {fontDropdownOpen && (
            <div className="absolute z-50 bg-white border rounded shadow mt-1 max-h-60 overflow-auto w-full">
              <input
                type="text"
                placeholder="Поиск шрифта..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1 border-b outline-none"
                autoFocus
              />

              {recentFonts.length > 0 && (
                <div className="p-2 border-b">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Недавно использованные</div>
                  {recentFonts.map(font => (
                    <div
                      key={font}
                      onClick={() => onSelectFont(font)}
                      className="cursor-pointer px-2 py-1 rounded hover:bg-blue-100"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </div>
                  ))}
                </div>
              )}

              <div className="p-2">
                {filteredFonts.length > 0 ? (
                  filteredFonts.map(font => (
                    <div
                      key={font}
                      onClick={() => onSelectFont(font)}
                      className="cursor-pointer px-2 py-1 rounded hover:bg-blue-100"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 px-2 py-1">Шрифты не найдены</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Размер и кнопки */}
        <div className="flex items-center gap-1 min-w-[160px]">
          <select
            className="border px-2 py-1 rounded bg-gray-50 w-full"
            value={(editor.getAttributes('textStyle') as any).fontSize || 14}
            onChange={e => {
              let val = Number(e.target.value);
              if (val < 8) val = 8;
              else if (val > 64) val = 64;
              editor.chain().focus().setFontSize(val).run();
            }}
          >
            {[8,10,12,14,16,18,20,24,28,32,36,40,44,48,52,56,60,64].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          <button
            type="button"
            className="p-2 border rounded hover:bg-gray-200 flex items-center justify-center"
            onClick={() => {
              const currentSize = (editor.getAttributes('textStyle') as any).fontSize || 14;
              const newSize = Math.min(currentSize + 1, 64);
              editor.chain().focus().setFontSize(newSize).run();
            }}
            title="Увеличить размер шрифта"
          >
            <FaPlus />
          </button>

          <button
            type="button"
            className="p-2 border rounded hover:bg-gray-200 flex items-center justify-center"
            onClick={() => {
              const currentSize = (editor.getAttributes('textStyle') as any).fontSize || 14;
              const newSize = Math.max(currentSize - 1, 8);
              editor.chain().focus().setFontSize(newSize).run();
            }}
            title="Уменьшить размер шрифта"
          >
            <FaMinus />
          </button>
        </div>
      </div>

      {/* Вторая строка: стиль и цвета */}
      <div className="flex gap-2 flex-wrap items-center">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Жирный (Ctrl+B)"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Курсив (Ctrl+I)"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Подчеркнутый"
        >
          <FaUnderline />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${editor.isActive('strike') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Зачеркнутый"
        >
          <FaStrikethrough />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`p-2 rounded ${editor.isActive('superscript') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Надстрочный"
        >
          <FaSuperscript />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`p-2 rounded ${editor.isActive('subscript') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          title="Подстрочный"
        >
          <FaSubscript />
        </button>

        {/* Цвет текста */}
        <div className="relative" ref={textColorRef}>
          <span className="sr-only">Цвет текста</span>
          <button
            type="button"
            className="w-10 h-8 rounded border flex items-center justify-center"
            style={{ backgroundColor: (editor.getAttributes('textStyle') as any).color || '#000000' }}
            onClick={() => {
              setShowTextColorPicker(show => !show);
              setShowHighlightColorPicker(false);
            }}
            title="Цвет текста"
          >
            <FaFont color="#fff" />
          </button>
          {showTextColorPicker && (
            <ColorPicker onSelect={color => {
              editor.chain().focus().setColor(color).run();
              setShowTextColorPicker(false);
            }} />
          )}
        </div>

        {/* Цвет фона */}
        <div className="relative" ref={highlightColorRef}>
          <span className="sr-only">Цвет подсветки</span>
          <button
            type="button"
            className="w-10 h-8 rounded border flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
            onClick={() => {
              setShowHighlightColorPicker(show => !show);
              setShowTextColorPicker(false);
            }}
            title="Цвет подсветки"
          >
            <FaFillDrip color="#fff" />
          </button>
          {showHighlightColorPicker && (
            <ColorPicker onSelect={color => {
              editor.chain().focus().setHighlight({ color }).run();
              setShowHighlightColorPicker(false);
            }} />
          )}
        </div>
      </div>
    </div>
  </>
)}


        {/* Вкладка Вставка */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setHorizontalRule().run();
              }}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              title="Вставить горизонтальную линию"
            >
              ────────────
            </button>
          </div>
        )}

        {/* Вкладка Макет */}
        {activeTab === 'layout' && (
          <div className="text-gray-600 italic">Макет пока не реализован</div>
        )}
      </div>
    </div>
  );
};
