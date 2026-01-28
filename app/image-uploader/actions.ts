'use server';

import { CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import { cloudFrontClient, getImageUrl, S3_CONFIG, s3Client } from '@/lib/s3-client';

const MAX_FILE_SIZE = 150 * 1024; // 150KB
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
