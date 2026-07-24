import { TributeSummary } from '../tributes/dto';

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
  // Centurião da legião (§14.1). Vem resolvido ao vivo em TODO payload de autor
  // — feed, comentários, fila de revisão, leaderboards, notificações, menções —
  // então o selo pode ser exibido em qualquer um desses pontos sem chamada
  // extra. Best-effort no backend: uma falha derruba o selo, nunca a identidade,
  // por isso o default é `false` e não um estado de erro.
  is_legion_leader?: boolean;
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
  // Resumo de tributos do post (§26). Opcional porque o feed só passou a
  // devolvê-lo depois — um app apontado para um backend antigo não recebe o
  // campo e simplesmente não mostra o resumo.
  tributes?: TributeSummary;
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

export interface UpdatePostInput {
  body?: string | null;
  image_key?: string | null; // "" / null limpa a imagem legada
  // `media`/`mentions`, quando enviados, SUBSTITUEM o conjunto inteiro do post.
  media?: PostMediaInput[];
  mentions?: string[];
}

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
