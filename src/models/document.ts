export interface Document {
  id: number;
  name: string;
  creatorId: number;
}

export type DocumentRole = 'Creator' | 'Editor' | 'Viewer';

export interface UserDocumentDto {
  document: Document;
  role: DocumentRole;
}
