export interface EditorAttributes {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  color?: string;
  highlight?: string | null;
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  bulletList?: boolean;
  orderedList?: boolean;
}

export type FontOption = string;

export type FontSize = number;

export interface BulletListStyle {
  value: string;
  name: string;
}

export interface OrderedListStyle {
  level: number;
  name: string;
}