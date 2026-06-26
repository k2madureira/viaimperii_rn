import { apiFetch, readContent, readError } from '../config/defaultApi';

// ── Tipos ──────────────────────────────────────────────────────────────────────

// Lente de leitura da timeline (não é a coluna `scope` do evento).
export type FeedView = 'home' | 'global' | 'legion' | 'province' | 'following';
// Audiência de um post (gravada na linha do evento).
export type FeedScope = 'global' | 'legion' | 'province';
export type ReactionType = 'like' | 'clap' | 'fire' | 'salute';

// Verbo do evento: posts do usuário + eventos automáticos do domínio.
export type FeedVerb =
  | 'user_post'
  | 'mission_completed'
  | 'rank_up'
  | 'medal_earned'
  | 'achievement_unlocked'
  | 'legion_joined'
  | 'campaign_completed';

export interface FeedRankMini {
  id: number;
  name: string;
  image: string | null;
}

export interface FeedActiveAvatar {
  id: number;
  name: string;
  slug: string;
  url: string;
  type: string;
}

// Identidade do autor, resolvida ao vivo na leitura (avatar/nome/patente atuais).
export interface FeedAuthor {
  id: string; // uuid do usuário
  name: string;
  image: string | null; // foto enviada / OAuth
  active_avatar: FeedActiveAvatar | null;
  rank: FeedRankMini | null;
  legion_id: number | null;
}

export interface ReactionSummary {
  total: number;
  by_type: Partial<Record<ReactionType, number>>;
  mine: ReactionType | null;
}

export interface FeedItem {
  id: number;
  verb: FeedVerb | string;
  source: 'user' | 'system';
  scope: FeedScope | string;
  author: FeedAuthor;
  body: string | null; // texto do post (user_post)
  image_url: string | null; // imagem pública do post
  payload: Record<string, any> | null; // snapshot do evento de sistema
  reactions: ReactionSummary;
  comments_count: number;
  created_at: string;
}

export interface FeedListResponse {
  items: FeedItem[];
  nextCursor: number | null;
}

export interface FeedComment {
  id: number;
  parent_id: number | null;
  author: FeedAuthor;
  body: string;
  created_at: string;
}

export interface FeedCommentsResponse {
  items: FeedComment[];
  nextCursor: number | null;
}

export interface ReactResponse {
  feed_event_id: number;
  total: number;
  by_type: Partial<Record<ReactionType, number>>;
  mine: ReactionType | null;
}

// ── Timeline ────────────────────────────────────────────────────────────────────

export async function getFeed(
  scope: FeedView = 'home',
  cursor?: number | null,
  perPage = 20,
): Promise<FeedListResponse> {
  const parts = [`scope=${scope}`, `perPage=${perPage}`];
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(`/feed?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o feed'));
  }

  return readContent<FeedListResponse>(response);
}

export interface CreatePostInput {
  body?: string;
  image_key?: string;
  scope?: FeedScope;
}

export async function createPost(input: CreatePostInput): Promise<FeedItem> {
  const response = await apiFetch('/feed', {
    method: 'POST',
    body: JSON.stringify({ scope: 'global', ...input }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao publicar'));
  }

  return readContent<FeedItem>(response);
}

export interface UpdatePostInput {
  body?: string | null;
  image_key?: string | null; // "" / null limpa a imagem
}

export async function updatePost(eventId: number, input: UpdatePostInput): Promise<FeedItem> {
  const response = await apiFetch(`/feed/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao editar publicação'));
  }

  return readContent<FeedItem>(response);
}

export async function deletePost(eventId: number): Promise<void> {
  const response = await apiFetch(`/feed/${eventId}`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao excluir publicação'));
  }
}

// ── Reações ───────────────────────────────────────────────────────────────────

export async function reactFeed(eventId: number, type: ReactionType): Promise<ReactResponse> {
  const response = await apiFetch(`/feed/${eventId}/react`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao reagir'));
  }

  return readContent<ReactResponse>(response);
}

export async function unreactFeed(eventId: number): Promise<ReactResponse> {
  const response = await apiFetch(`/feed/${eventId}/react`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao remover reação'));
  }

  return readContent<ReactResponse>(response);
}

// ── Comentários ─────────────────────────────────────────────────────────────────

export async function getFeedComments(
  eventId: number,
  cursor?: number | null,
  perPage = 20,
): Promise<FeedCommentsResponse> {
  const parts = [`perPage=${perPage}`];
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(`/feed/${eventId}/comments?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar comentários'));
  }

  return readContent<FeedCommentsResponse>(response);
}

export async function createComment(
  eventId: number,
  body: string,
  parentId?: number | null,
): Promise<FeedComment> {
  const response = await apiFetch(`/feed/${eventId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body, parent_id: parentId ?? null }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao comentar'));
  }

  return readContent<FeedComment>(response);
}

// ── Upload de imagem do post (objeto PÚBLICO) ─────────────────────────────────

export type FeedImageContentType = 'image/jpeg' | 'image/png' | 'image/webp';

interface FeedPresignResult {
  upload_url: string;
  key: string;
  public: boolean;
  expires_in: number;
}

async function presignFeedUpload(contentType: FeedImageContentType): Promise<FeedPresignResult> {
  const response = await apiFetch('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ content_type: contentType, purpose: 'feed' }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao preparar o envio da imagem'));
  }
  return readContent<FeedPresignResult>(response);
}

/**
 * Faz upload da imagem do post direto ao S3 (presigned PUT, objeto público) e
 * retorna a `key` para enviar como `image_key` no POST /feed. Diferente da
 * evidência (privada), o feed exige o header `x-amz-acl: public-read` no PUT.
 */
export async function uploadFeedImage(
  localUri: string,
  contentType: FeedImageContentType,
): Promise<string> {
  const { upload_url, key } = await presignFeedUpload(contentType);
  const blob = await (await fetch(localUri)).blob();
  const put = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, 'x-amz-acl': 'public-read' },
    body: blob,
  });
  if (!put.ok) {
    throw new Error('Falha ao enviar a imagem para o armazenamento.');
  }
  return key;
}
