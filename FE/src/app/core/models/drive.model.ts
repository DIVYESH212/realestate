export interface DriveItemDTO {
  _id: string;
  name: string;
  folderPath?: string;
  publicUrl?: string;
  isDirectory?: boolean;
  size: number;
  mimeType?: string;
  extension?: string;
  category: 'sheet' | 'doc' | 'slide' | 'pdf' | 'image' | 'video' | 'audio' | 'zip' | 'folder' | 'other';
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriveListResponse {
  items: DriveItemDTO[];
  currentPath?: string;
  totalFiles: number;
  totalStorageBytes: number;
}
