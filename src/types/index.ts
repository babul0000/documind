export interface User {
  id: string;
  name: string;
  email: string;
}

export interface KeyInfo {
  documentType?: string;
  suggestedTitle?: string;
  keyTopics?: string[];
  entities?: string[];
  actionItems?: string[];
  dates?: string[];
}

export interface Document {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  textContent?: string;
  summary?: string;
  keyInfo?: KeyInfo;
  error?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  documentId: string;
  title: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

export interface Analytics {
  totalDocuments: number;
  totalSize: number;
  typeDistribution: {
    name: string;
    value: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  activityChart: {
    date: string;
    uploads: number;
  }[];
}
