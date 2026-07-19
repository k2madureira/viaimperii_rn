
import { apiFetch, readContent, readError } from '../config/defaultApi';


export type ImageContentType = 'image/jpeg' | 'image/png' | 'image/webp';
export type VideoContentType = 'video/mp4' | 'video/quicktime';
export type MediaContentType = ImageContentType | VideoContentType;

interface PresignResult {
  upload_url: string;
  key: string;
  public: boolean;
  expires_in: number;
}

async function presign(contentType: MediaContentType, purpose?: string): Promise<PresignResult> {
  const response = await apiFetch('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({
    content_type: contentType,
    ...(purpose ? { purpose } : {})
  }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao preparar o envio da mídia'));
  }
  return readContent<PresignResult>(response);
}


export async function uploadMedia(
  localUri: string,
  contentType: MediaContentType,
  purpose?: string
): Promise<string> {
  const { upload_url, key, public: isPublic } = await presign(contentType, purpose);
  const blob = await (await fetch(localUri)).blob();
  const put = await fetch(upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      // Presign público (purpose=feed) assina a ACL public-read; o PUT precisa enviá-la.
      ...(isPublic ? { 'x-amz-acl': 'public-read' } : {}),
    },
    body: blob,
  });

  if (!put.ok) {
    throw new Error('Falha ao enviar a mídia para o armazenamento.');
  }
  return key;
}