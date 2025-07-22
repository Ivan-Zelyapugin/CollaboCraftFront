import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { 
  FaPlus, FaTrash, FaBold, FaItalic, FaStrikethrough, FaUnderline, 
  FaSuperscript, FaSubscript, FaFont, FaFillDrip, 
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify 
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

// Отсортируем один раз по алфавиту
const sortedFonts = [...fontOptions].sort((a, b) => a.localeCompare(b));

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onAddBlock }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'home' | 'insert' | 'layout'>('home');
  const [showFileMenu, setShowFileMenu] = useState(false);

  // Для дропдауна с шрифтами
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentFonts, setRecentFonts] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Текущий выбранный шрифт в редакторе
  const currentFont = (editor.getAttributes('textStyle') as any).fontFamily || 'Times New Roman';

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFontDropdownOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // При выборе шрифта
  const onSelectFont = (font: string) => {
    editor.chain().focus().setFontFamily(font).run();
    setFontDropdownOpen(false);
    setSearchTerm('');

    // Добавляем в недавно использованные (без повторов, максимум 5)
    setRecentFonts(prev => {
      const newList = [font, ...prev.filter(f => f !== font)];
      return newList.slice(0, 5);
    });
  };

  // Фильтрация по поиску (case insensitive)
  const filteredFonts = sortedFonts.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!editor) return null;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md border-b px-4 py-2 w-full">
      <div className="flex border-b mb-2">
        {(['file', 'home', 'insert', 'layout'] as const).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => {
              setActiveTab(tab);
              setShowFileMenu(false);
            }}
          >
            {tab === 'file' ? 'Файл' : tab === 'home' ? 'Главная' : tab === 'insert' ? 'Вставка' : 'Макет'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 relative">
        {activeTab === 'file' && (
          <div>
            <button
              className="bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200"
              onClick={() => setShowFileMenu(prev => !prev)}
            >
              📁 Меню файла
            </button>
            {showFileMenu && (
              <div className="absolute mt-2 bg-white border rounded shadow z-50 w-48">
                <button
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

        {activeTab === 'home' && (
          <>
            {/* Блоки */}
            <div className="flex flex-col border-r pr-4">
              <span className="text-sm font-semibold text-gray-500 mb-1">Блоки</span>
              <button
                onClick={onAddBlock}
                className="bg-blue-600 text-white px-3 py-1 mb-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus /> Добавить
              </button>
              <button
                disabled
                className="bg-gray-300 text-white px-3 py-1 rounded cursor-not-allowed flex items-center gap-2"
              >
                <FaTrash /> Удалить
              </button>
            </div>

            {/* Шрифт */}
            <div className="flex flex-col border-r pr-4 min-w-[280px]" ref={dropdownRef}>
              <span className="text-sm font-semibold text-gray-500 mb-1">Шрифт</span>

              {/* Кастомный дропдаун */}
              <div className="relative">
                <button
                  className="w-full border px-3 py-1 rounded bg-white text-left cursor-pointer"
                  onClick={() => setFontDropdownOpen(open => !open)}
                  style={{ fontFamily: currentFont }}
                >
                  {currentFont}
                </button>

                {fontDropdownOpen && (
                  <div className="absolute z-50 bg-white border rounded shadow mt-1 max-h-60 overflow-auto w-full">
                    {/* Поиск */}
                    <input
                      type="text"
                      placeholder="Поиск шрифта..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-1 border-b outline-none"
                      autoFocus
                    />

                    {/* Недавно использованные */}
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

                    {/* Все шрифты */}
                    <div className="p-2">
                      {filteredFonts.length > 0 ? filteredFonts.map(font => (
                        <div
                          key={font}
                          onClick={() => onSelectFont(font)}
                          className="cursor-pointer px-2 py-1 rounded hover:bg-blue-100"
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </div>
                      )) : (
                        <div className="text-gray-500 px-2 py-1">Шрифты не найдены</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Остальной код: размер шрифта, стили текста и выравнивание оставим без изменений */}
            <div className="flex flex-col border-r pr-4 min-w-[120px]">
              <span className="text-sm font-semibold text-gray-500 mb-1">Размер</span>
              <select
                className="border px-2 py-1 rounded bg-gray-50"
                onChange={e => editor.chain().focus().setFontSize(Number(e.target.value)).run()}
                value={(editor.getAttributes('textStyle') as any).fontSize || 14}
              >
                {[10, 12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col border-r pr-4">
              <span className="text-sm font-semibold text-gray-500 mb-1">Стиль текста</span>
              <div className="flex flex-wrap gap-1 items-center">
                {[{ icon: FaBold, command: 'toggleBold', label: 'Жирный' },
                  { icon: FaItalic, command: 'toggleItalic', label: 'Курсив' },
                  { icon: FaStrikethrough, command: 'toggleStrike', label: 'Зачёркнутый' },
                  { icon: FaUnderline, command: 'toggleUnderline', label: 'Подчёркнутый' },
                  { icon: FaSuperscript, command: 'toggleSuperscript', label: 'Надстрочный' },
                  { icon: FaSubscript, command: 'toggleSubscript', label: 'Подстрочный' }]
                  .map(({ icon: Icon, command, label }) => (
                    <button
                      key={command}
                      onClick={() => (editor.chain().focus() as any)[command]().run()}
                      title={label}
                      className={`p-1 ${editor.isActive(command.replace('toggle', '').toLowerCase()) ? 'bg-blue-100' : ''}`}
                    >
                      <Icon />
                    </button>
                  ))}

                <label className="flex items-center gap-1" title="Цвет текста">
                  <FaFont />
                  <input
                    type="color"
                    onChange={e => (editor.chain() as any).focus().setColor(e.target.value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                  />
                </label>

                <label className="flex items-center gap-1" title="Цвет фона">
                  <FaFillDrip />
                  <input
                    type="color"
                    onChange={e => (editor.chain() as any).focus().setHighlight({ color: e.target.value }).run()}
                    value={editor.getAttributes('highlight')?.color || '#ffffff'}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col border-r pr-4">
              <span className="text-sm font-semibold text-gray-500 mb-1">Абзац</span>
              <div className="flex gap-2 items-center">
                {[{ icon: FaAlignLeft, align: 'left' },
                  { icon: FaAlignCenter, align: 'center' },
                  { icon: FaAlignRight, align: 'right' },
                  { icon: FaAlignJustify, align: 'justify' }]
                  .map(({ icon: Icon, align }) => (
                    <button
                      key={align}
                      onClick={() => editor.chain().focus().setTextAlign(align).run()}
                      title={`Выравнивание: ${align}`}
                      className={`p-1 ${editor.isActive({ textAlign: align }) ? 'bg-blue-100' : ''}`}
                    >
                      <Icon />
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
