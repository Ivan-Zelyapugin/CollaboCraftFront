import React from 'react';

interface FileTabProps {
  setShowFileMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showFileMenu: boolean;
}

export const FileTab: React.FC<FileTabProps> = ({ setShowFileMenu, showFileMenu }) => {
  return (
    <div>
      <button
        type="button"
        className="bg-gray-100 px-4 py-2 rounded shadow hover:bg-gray-200"
        onClick={() => setShowFileMenu((prev) => !prev)}
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
  );
};