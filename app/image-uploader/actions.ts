'use server';

import { CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { cloudFrontClient, getImageUrl, S3_CONFIG, s3Client } from '@/lib/s3-client';

// Max file size after processing (generous limit - processing keeps files small)
const MAX_PROCESSED_FILE_SIZE = 500 * 1024; // 500KB
const ALLOWED_MIME_TYPE = 'image/jpeg';

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

async function checkImageExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: S3_CONFIG.bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function invalidateCloudFrontCache(path: string): Promise<void> {
  const command = new CreateInvalidationCommand({
    DistributionId: S3_CONFIG.cloudfrontDistributionId,
    InvalidationBatch: {
      CallerReference: `${path}-${Date.now()}`,
      Paths: {
        Quantity: 1,
        Items: [path],
      },
    },
  });

  await cloudFrontClient.send(command);
}

/**
 * Upload a processed image to S3
 * Expects the image to already be processed (resized, compressed, converted to JPG)
 */
export async function uploadImageAction(uuid: string, formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  // Server-side validation (processed images should always be JPEG)
  if (file.type !== ALLOWED_MIME_TYPE) {
    return { success: false, error: 'Only processed JPG files are allowed' };
  }

  if (file.size > MAX_PROCESSED_FILE_SIZE) {
    return { success: false, error: 'Processed file size exceeds limit' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${S3_CONFIG.prefix}${uuid}.jpg`;

    // Check if image already exists (for cache invalidation decision)
    const isReplacement = await checkImageExists(key);

    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: ALLOWED_MIME_TYPE,
    });

    await s3Client.send(command);

    // Only invalidate CloudFront cache if replacing an existing image
    if (isReplacement) {
      try {
        await invalidateCloudFrontCache(`/${key}`);
      } catch (invalidationError) {
        console.error('CloudFront invalidation error:', invalidationError);
      }
    }

    // Return URL with cache bust timestamp as fallback for replacements
    const imageUrl = getImageUrl(uuid, isReplacement ? Date.now() : undefined);

    return { success: true, imageUrl };
  } catch (error) {
    console.error('S3 upload error:', error);
    return { success: false, error: 'Failed to upload image to S3' };
  }
}

/**
 * Batch upload multiple images to S3
 * Returns results for each upload attempt
 */
export async function uploadImagesAction(
  uploads: Array<{ uuid: string; formData: FormData }>,
): Promise<Array<{ uuid: string; result: UploadResult }>> {
  const results: Array<{ uuid: string; result: UploadResult }> = [];

  // Process uploads sequentially to avoid overwhelming S3
  for (const upload of uploads) {
    const result = await uploadImageAction(upload.uuid, upload.formData);
    results.push({ uuid: upload.uuid, result });
  }

  return results;
}
