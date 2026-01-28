'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';

import { getImageUrl, s3Client, S3_CONFIG } from '@/lib/s3-client';

const MAX_FILE_SIZE = 150 * 1024; // 150KB
const ALLOWED_MIME_TYPE = 'image/jpeg';

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function uploadImageAction(uuid: string, formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  // Server-side validation
  if (file.type !== ALLOWED_MIME_TYPE) {
    return { success: false, error: 'Only JPG files are allowed' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File size must be under 150KB' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${S3_CONFIG.prefix}${uuid}.jpg`;

    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: ALLOWED_MIME_TYPE,
    });

    await s3Client.send(command);

    // Return URL with cache bust timestamp
    const imageUrl = getImageUrl(uuid, Date.now());

    return { success: true, imageUrl };
  } catch (error) {
    console.error('S3 upload error:', error);
    return { success: false, error: 'Failed to upload image to S3' };
  }
}
