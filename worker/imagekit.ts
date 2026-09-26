import type { ImageKitUploadAuthRequest, ImageKitUploadAuthResponse, Env } from './types';

export async function generateImageKitUploadAuth(
  request: ImageKitUploadAuthRequest,
  env: Env
): Promise<ImageKitUploadAuthResponse> {
  const timestamp = Math.floor(Date.now() / 1000);
  const expire = timestamp + 30;
  const token = crypto.randomUUID();

  const privateKey = env.IMAGEKIT_PRIVATE_KEY;
  const stringToSign = `${privateKey}${expire}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const messageData = encoder.encode(stringToSign);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  const signatureArray = new Uint8Array(signatureBuffer);
  const signature = Array.from(signatureArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    token,
    expire,
    signature,
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    url: env.IMAGEKIT_URL_ENDPOINT
  };
}

export function validateImageKitFileType(fileType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ];
  return allowedTypes.includes(fileType);
}

export function validateImageKitFileSize(size: number | undefined): boolean {
  if (!size) return true;
  const maxSize = 10 * 1024 * 1024;
  return size <= maxSize;
}
