// utils/editorUtils.ts
import { Editor } from "@tiptap/react";
import { EditorAttributes } from "../ToolBar/HomeTab/Ts/types";

export function getEditorAttributes(editor: Editor): EditorAttributes {
  return {
    fontFamily: editor.getAttributes('textStyle')?.fontFamily || 'Times New Roman',
    fontSize: editor.getAttributes('textStyle')?.fontSize || 14,
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    underline: editor.isActive('underline'),
    strike: editor.isActive('strike'),
    superscript: editor.isActive('superscript'),
    subscript: editor.isActive('subscript'),
    color: editor.getAttributes('textStyle')?.color || '#000000',
    highlight: editor.getAttributes('highlight')?.color || null,
    textAlign: editor.getAttributes('paragraph')?.textAlign || 'left',
    bulletList: editor.isActive('bulletList'),
    orderedList: editor.isActive('orderedList'),
  };
}
