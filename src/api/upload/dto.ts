export type ImageContentType = 'image/jpeg' | 'image/png' | 'image/webp';
export type VideoContentType = 'video/mp4' | 'video/quicktime';
export type MediaContentType = ImageContentType | VideoContentType;

export interface PresignResult {
  upload_url: string;
  key: string;
  public: boolean;
  expires_in: number;
}
