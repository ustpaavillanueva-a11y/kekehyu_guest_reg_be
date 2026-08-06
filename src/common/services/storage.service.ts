export interface StorageService {
  uploadPdf(file: Buffer, fileName: string, guestId: string): Promise<string>;
  deletePdf(filePath: string): Promise<void>;
  getPublicUrl(filePath: string): string;
}

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
