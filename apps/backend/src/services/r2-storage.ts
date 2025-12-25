import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../env.js';
import { logger } from '../middleware/logger.js';

let s3Client: S3Client | null = null;

// Initialize R2 client if configured
if (env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  logger.info('R2 storage initialized');
}

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string | null> {
  if (!s3Client || !env.R2_BUCKET_NAME) {
    logger.warn('R2 not configured, skipping upload');
    return null;
  }

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    const publicUrl = env.R2_PUBLIC_URL
      ? `${env.R2_PUBLIC_URL}/${key}`
      : `https://${env.R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    logger.debug('Uploaded to R2', { key, contentType });
    return publicUrl;
  } catch (error) {
    logger.error('Failed to upload to R2', error, { key });
    return null;
  }
}

/**
 * Check if a file exists in R2
 */
export async function existsInR2(key: string): Promise<boolean> {
  if (!s3Client || !env.R2_BUCKET_NAME) {
    return false;
  }

  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the public URL for a file
 */
export function getR2PublicUrl(key: string): string | null {
  if (!env.R2_PUBLIC_URL) return null;
  return `${env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Check if R2 is available
 */
export function isR2Available(): boolean {
  return s3Client !== null && !!env.R2_BUCKET_NAME;
}

export { s3Client };
