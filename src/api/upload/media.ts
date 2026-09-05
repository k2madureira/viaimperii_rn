import { apiFetch, readContent, readError } from '../config/defaultApi';
import { MediaContentType, PresignResult } from './dto';

async function presign(contentType: MediaContentType, purpose?: string): Promise<PresignResult> {
  const response = await apiFetch('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({
      content_type: contentType,
      ...(purpose ? { purpose } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao preparar o envio da mídia'));
  }
  return readContent<PresignResult>(response);
}

/** Extensão de arquivo por content-type, para nomear a parte `file` do multipart. */
function extensionFor(contentType: MediaContentType): string {
  const map: Record<MediaContentType, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
  };
  return map[contentType] ?? 'bin';
}

export async function uploadMedia(
  localUri: string,
  contentType: MediaContentType,
  purpose?: string,
): Promise<string> {
  const presigned = await presign(contentType, purpose);

  // Preferir o POST multipart (novo contrato: policy + limite de tamanho). O S3
  // recusa (403) o que exceder `max_bytes`, então nem precisamos ler o arquivo
  // inteiro em memória para medir — o campo `file` vai como referência de URI.
  if (presigned.post_url && presigned.post_fields) {
    const form = new FormData();
    Object.entries(presigned.post_fields).forEach(([k, v]) => form.append(k, String(v)));
    // No RN, arquivos vão como { uri, name, type } — e o `file` DEVE ser o último.
    form.append('file', {
      uri: localUri,
      name: `upload.${extensionFor(contentType)}`,
      type: contentType,
    } as any);

    const post = await fetch(presigned.post_url, { method: 'POST', body: form });
    if (!post.ok) {
      if (post.status === 403 && presigned.max_bytes) {
        const mb = Math.floor(presigned.max_bytes / (1024 * 1024));
        throw new Error(`Arquivo grande demais. Tamanho máximo: ${mb} MB.`);
      }
      throw new Error('Falha ao enviar a mídia para o armazenamento.');
    }
    return presigned.key;
  }

  // Fallback: PUT legado (respostas antigas sem post_url).
  const blob = await (await fetch(localUri)).blob();
  const put = await fetch(presigned.upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      // Presign público (purpose=feed) assina a ACL public-read; o PUT precisa enviá-la.
      ...(presigned.public ? { 'x-amz-acl': 'public-read' } : {}),
    },
    body: blob,
  });

  if (!put.ok) {
    throw new Error('Falha ao enviar a mídia para o armazenamento.');
  }
  return presigned.key;
}
