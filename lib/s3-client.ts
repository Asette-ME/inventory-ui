import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET_NAME || 'images.asette.ai',
  prefix: 'small/',
  cloudfrontUrl: 'https://dn3kc9exuk533.cloudfront.net',
};

export function getImageUrl(uuid: string, cacheBust?: number): string {
  const url = `${S3_CONFIG.cloudfrontUrl}/${S3_CONFIG.prefix}${uuid}.jpg`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}
