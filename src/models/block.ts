export interface Block {
  id: number;
  text: string;
  documentId: number;
  userId: number;
  sentOn: string;
  editedOn?: string;
}

export interface SendBlockRequest {
  text: string;
  documentId: number;
}

export interface EditBlockRequest {
  id: number;
  editedText: string;
}