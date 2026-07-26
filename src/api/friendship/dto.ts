import { FeedAuthor } from '../feed';

// Estado da aresta de amizade. `none` = sem relação (após desfazer/desbloquear).
export type FriendshipStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'blocked'
  | 'none';

export type RequestDirection = 'incoming' | 'outgoing';

// Presença que ESTE viewer enxerga (§Amigos §4). O status `invisible` do amigo
// nunca vaza — colapsa em `offline` e esconde o `last_seen_at`. Portanto os únicos
// valores possíveis aqui são os quatro abaixo.
export type PresenceStatus = 'available' | 'busy' | 'away' | 'offline';

// Um amigo aceito. `is_online` = visto na janela de presença; `presence_status` =
// visibilidade real do amigo enquanto online (available/busy/away) ou `offline`.
export interface FriendItem {
  friendship_id: number;
  user: FeedAuthor;
  friends_since: string | null;
  is_online: boolean;
  presence_status: PresenceStatus;
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
