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
  thumb: string | null; // webp leve (256px) p/ badge de patente
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

export type MediaType = 'image' | 'video';

// Item de mídia de um post (multi-mídia ordenada). Coexiste com o `image_url`
// legado (single-image) — ambos podem vir juntos na resposta.
export interface PostMedia {
  key: string; // key pública no S3
  type: MediaType;
  url: string; // url pública permanente
}

export interface FeedItem {
  id: number;
  verb: FeedVerb | string;
  source: 'user' | 'system';
  scope: FeedScope | string;
  author: FeedAuthor;
  body: string | null; // texto do post (markdown leve: **negrito**, _itálico_, ~~riscado~~)
  image_url: string | null; // imagem pública do post — caminho legado single-image
  payload: Record<string, any> | null; // snapshot do evento de sistema
  hashtags: string[]; // extraídas do body no backend (#tag, minúsculo, dedup)
  mentions: FeedAuthor[]; // menções resolvidas ao vivo
  media: PostMedia[]; // imagens/vídeos ordenados
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

// ── Busca de usuários (autocomplete de @menção) ───────────────────────────────

interface UserSearchResponse {
  items: FeedAuthor[];
}

/**
 * Busca usuários por username para o autocomplete de menções. Como `username`
 * não é único, pode trazer homônimos — o client resolve o escolhido pelo `id`
 * (uuid) e o envia em `mentions`. Tolerante ao formato de resposta.
 */
export async function searchUsers(q: string, limit = 8): Promise<FeedAuthor[]> {
  const response = await apiFetch(`/users/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao buscar usuários'));
  }
  const data = await readContent<UserSearchResponse | FeedAuthor[]>(response);
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
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

/**
 * Todos os posts de uma hashtag (mais recentes primeiro, keyset por cursor=id).
 * `tag` é normalizado como as hashtags salvas (# opcional, minúsculo no backend).
 * Mesma audiência/shape de `getFeed`.
 */
export async function getHashtagFeed(
  tag: string,
  cursor?: number | null,
  perPage = 20,
): Promise<FeedListResponse> {
  const normalized = tag.replace(/^#/, '');
  const parts = [`perPage=${perPage}`];
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(
    `/feed/hashtag/${encodeURIComponent(normalized)}?${parts.join('&')}`,
  );

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar posts da hashtag'));
  }

  return readContent<FeedListResponse>(response);
}

/**
 * Detalhe de um item do feed (post ou evento de sistema) — mesmo formato de um
 * item da timeline, com autor/reações resolvidos ao vivo. 404 se fora da
 * audiência do usuário.
 */
export async function getFeedEvent(eventId: number): Promise<FeedItem> {
  const response = await apiFetch(`/feed/${eventId}`);
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a publicação'));
  }
  return readContent<FeedItem>(response);
}

// Item de mídia enviado na criação/edição: `key` pública (do presign) + tipo.
export interface PostMediaInput {
  key: string;
  type?: MediaType; // default 'image' no backend
}

export interface CreatePostInput {
  body?: string;
  image_key?: string; // caminho legado single-image (compatibilidade)
  media?: PostMediaInput[]; // multi-mídia ordenada (imagens/vídeos)
  mentions?: string[]; // uuids dos usuários mencionados (resolvidos no client)
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
  image_key?: string | null; // "" / null limpa a imagem legada
  // `media`/`mentions`, quando enviados, SUBSTITUEM o conjunto inteiro do post.
  media?: PostMediaInput[];
  mentions?: string[];
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

// ── Quem reagiu ─────────────────────────────────────────────────────────────────

export interface Reactor {
  user: FeedAuthor;
  type: ReactionType;
  reacted_at: string;
}

export interface ReactorsResponse {
  total: number;
  by_type: Partial<Record<ReactionType, number>>;
  items: Reactor[];
  nextCursor: number | null;
}

export async function getReactors(
  eventId: number,
  type?: ReactionType | null,
  cursor?: number | null,
  perPage = 20,
): Promise<ReactorsResponse> {
  const parts = [`perPage=${perPage}`];
  if (type) parts.push(`type=${type}`);
  if (cursor != null) parts.push(`cursor=${cursor}`);
  const response = await apiFetch(`/feed/${eventId}/reactions?${parts.join('&')}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar reações'));
  }

  return readContent<ReactorsResponse>(response);
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

// ── Upload de mídia do post (objeto PÚBLICO) ──────────────────────────────────

export type FeedImageContentType = 'image/jpeg' | 'image/png' | 'image/webp';
export type FeedVideoContentType = 'video/mp4' | 'video/quicktime';
export type FeedMediaContentType = FeedImageContentType | FeedVideoContentType;

interface FeedPresignResult {
  upload_url: string;
  key: string;
  public: boolean;
  expires_in: number;
}

async function presignFeedUpload(contentType: FeedMediaContentType): Promise<FeedPresignResult> {
  const response = await apiFetch('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ content_type: contentType, purpose: 'feed' }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao preparar o envio da mídia'));
  }
  return readContent<FeedPresignResult>(response);
}

/**
 * Faz upload de uma mídia (imagem ou vídeo) do post direto ao S3 (presigned PUT,
 * objeto público) e retorna a `key`. Diferente da evidência (privada), o feed
 * exige o header `x-amz-acl: public-read` no PUT.
 */
export async function uploadFeedMedia(
  localUri: string,
  contentType: FeedMediaContentType,
): Promise<string> {
  const { upload_url, key } = await presignFeedUpload(contentType);
  const blob = await (await fetch(localUri)).blob();
  const put = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, 'x-amz-acl': 'public-read' },
    body: blob,
  });
  if (!put.ok) {
    throw new Error('Falha ao enviar a mídia para o armazenamento.');
  }
  return key;
}

/** @deprecated use `uploadFeedMedia` — mantido por compatibilidade. */
export const uploadFeedImage = (localUri: string, contentType: FeedImageContentType) =>
  uploadFeedMedia(localUri, contentType);
