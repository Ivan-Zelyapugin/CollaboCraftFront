import React, { useRef, useEffect } from 'react';

interface Props {
  text: string;
  editable: boolean;
  onChange: (text: string) => void;
  onFocus?: () => void;
  onImagePaste?: (file: File, insertAtCursor: (marker: string) => void) => void;
}

export const RichTextBlockEditor: React.FC<Props> = ({ text, editable, onChange, onFocus, onImagePaste }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el || el.innerText === text) return;

    const sel = window.getSelection();
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    const offset = range ? range.startOffset : 0;

    el.innerText = text;

    if (editable && sel && el.firstChild) {
      const newRange = document.createRange();
      const pos = Math.min(offset, el.innerText.length);
      newRange.setStart(el.firstChild, pos);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }, [text, editable]);

  const handleInput = () => {
    onChange(divRef.current?.innerText || '');
  };

  const insertAtCursor = (marker: string) => {
    const el = divRef.current;
    if (!el) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(marker));
    handleInput(); // синхронизируем
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
  if (!onImagePaste) return;

  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        e.preventDefault();
        onImagePaste(file, insertAtCursor);
        break; 
      }
    }
  }
};

  return (
    <div
      ref={divRef}
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={onFocus}
      onPaste={handlePaste}
      className="min-h-[24px] w-full p-1 transition-all
                 outline-none whitespace-pre-wrap break-words
                 focus:ring-2 focus:ring-blue-400
                 hover:bg-gray-50 focus:bg-white
                 rounded-sm"
      style={{ fontSize: 16, lineHeight: '24px' }}
      spellCheck={false}
    />
  );
};
