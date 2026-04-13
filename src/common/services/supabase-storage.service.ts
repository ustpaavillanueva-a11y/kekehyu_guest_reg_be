import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName = 'guest-pdfs';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Upload a PDF file to Supabase Storage
   * @param file - The file buffer
   * @param fileName - The name of the file
   * @param guestId - The guest ID for organizing files
   * @returns The public URL of the uploaded file
   */
  async uploadPdf(
    file: Buffer,
    fileName: string,
    guestId: string,
  ): Promise<string> {
    // Create a unique file path: pdfs/guestId/fileName
    const filePath = `pdfs/${guestId}/${fileName}`;

    try {
      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Don't overwrite if file exists
          contentType: 'application/pdf',
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Generate public URL
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  }

  /**
   * Delete a PDF file from Supabase Storage
   * @param filePath - The full path of the file to delete
   */
  async deletePdf(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete PDF: ${error.message}`);
    }
  }

  /**
   * Get public URL for a PDF file
   * @param filePath - The full path of the file
   * @returns The public URL
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
