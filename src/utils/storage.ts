
import { supabase } from '../lib/supabase';

/**
 * Uploads a file to a specific bucket and path in Supabase Storage.
 * @param bucketName The name of the storage bucket
 * @param path The path where the file will be stored (e.g., 'characters/avatar.png')
 * @param file The file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(bucketName: string, path: string, file: File): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
