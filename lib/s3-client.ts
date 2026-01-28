import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { S3Client } from '@aws-sdk/client-s3';

const awsCredentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: awsCredentials,
});

export const cloudFrontClient = new CloudFrontClient({
  region: process.env.AWS_REGION!,
  credentials: awsCredentials,
});

export const S3_CONFIG = {
  bucket: process.env.AWS_S3_BUCKET_NAME,
  prefix: 'small/',
  cloudfrontUrl: process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_URL!,
  cloudfrontDistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID!,
};

export function getImageUrl(uuid: string, cacheBust?: number): string {
  const url = `${S3_CONFIG.cloudfrontUrl}/${S3_CONFIG.prefix}${uuid}.jpg`;
  return cacheBust ? `${url}?t=${cacheBust}` : url;
}
