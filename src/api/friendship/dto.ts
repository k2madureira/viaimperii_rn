import { FeedAuthor } from '../feed';

// Estado da aresta de amizade. `none` = sem relação (após desfazer/desbloquear).
export type FriendshipStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'blocked'
  | 'none';

export type RequestDirection = 'incoming' | 'outgoing';

// Um amigo aceito. Presença (`is_online`/`last_seen_at`) é placeholder até o Chat
// entregar o stream SSE — o backend devolve `false`/`null` por ora (§Amigos §4).
export interface FriendItem {
  friendship_id: number;
  user: FeedAuthor;
  friends_since: string | null;
  is_online: boolean;
  last_seen_at: string | null;
}

// Um pedido pendente (recebido ou enviado). `id` = friendship id p/ aceitar/recusar.
export interface FriendRequestItem {
  id: number;
  user: FeedAuthor;
  direction: RequestDirection;
  created_at: string;
}

// Resposta de toda ação de comando (pedir/responder/desfazer/bloquear).
export interface FriendshipActionResult {
  friendship_id: number | null;
  status: FriendshipStatus;
  user: FeedAuthor | null;
  message: string;
}

export interface FriendsListResponse {
  total: number;
  items: FriendItem[];
}

export interface FriendRequestsResponse {
  total: number;
  items: FriendRequestItem[];
}

// Pedido por @handle (preferido) ou por user_id (fallback do autocomplete).
export interface SendFriendRequestInput {
  handle?: string;
  user_id?: string;
}
