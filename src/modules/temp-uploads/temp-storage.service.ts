import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TempStorageService {
  private supabase: SupabaseClient;
  private bucketName = 'temp-pdfs';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadPdf(file: Buffer, fileName: string): Promise<{ path: string; url: string }> {
    const filePath = `temp/${uuid()}-${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf',
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return { path: data.path, url: publicUrlData.publicUrl };
  }

  async deletePdf(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}
