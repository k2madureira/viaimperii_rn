export type ImageContentType = 'image/jpeg' | 'image/png' | 'image/webp';
export type VideoContentType = 'video/mp4' | 'video/quicktime';
export type MediaContentType = ImageContentType | VideoContentType;

export interface PresignResult {
  /** PUT legado (deprecado) — mantido só como fallback. */
  upload_url: string;
  key: string;
  public: boolean;
  expires_in: number;
  // Upload por POST multipart com policy/limite de tamanho (novo contrato). O
  // campo `file` deve ser o ÚLTIMO do form. Ausentes em respostas antigas.
  post_url?: string;
  post_fields?: Record<string, string>;
  /** Limite de tamanho do objeto; acima disso o S3 responde 403. */
  max_bytes?: number;
}
