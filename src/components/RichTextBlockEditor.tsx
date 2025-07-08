import React, { useRef, useEffect } from 'react';

interface Props {
  text: string;
  editable: boolean;
  onChange: (text: string) => void;
}

export const RichTextBlockEditor: React.FC<Props> = ({ text, editable, onChange }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && divRef.current.innerText !== text) {
      divRef.current.innerText = text;
    }
  }, [text]);

  const handleInput = () => {
    if (divRef.current) {
      onChange(divRef.current.innerText);
    }
  };

  return (
    <div
      ref={divRef}
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={handleInput}
      className="outline-none whitespace-pre-wrap break-words w-full h-full"
      style={{
        fontSize: 16,
        lineHeight: '24px',
        wordBreak: 'break-word',
        minHeight: '100%',
      }}
      spellCheck={false}
    />
  );
};
