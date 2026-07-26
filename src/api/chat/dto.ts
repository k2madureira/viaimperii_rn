import { FeedAuthor } from '../feed';

// Tipo de mensagem. Fase 1 = só texto (o backend aceita `image` em fase futura).
export type MessageKind = 'text' | 'image';

// Estado de moderação da mensagem (§Chat §4.6).
export type MessageStatus = 'visible' | 'flagged' | 'removed';

// Tipo de conversa. Fase 1 = `dm`; `legion`/`clan` são fases futuras do backend.
export type ConversationType = 'dm' | 'legion' | 'clan';

// Uma mensagem. `sender` é resolvido AO VIVO (§18) — pode ser null se o autor sumiu.
// `is_mine` diz se foi o usuário logado que enviou (alinhamento da bolha).
export interface MessageItem {
  id: number;
  conversation_id: number;
  sender: FeedAuthor | null;
  kind: MessageKind;
  body: string | null;
  status: MessageStatus;
  is_mine: boolean;
  created_at: string;
}

// Uma conversa do inbox. Numa DM, `peer` é o outro participante; em grupos, null.
export interface ConversationItem {
  id: number;
  type: ConversationType;
  peer: FeedAuthor | null;
  last_message: MessageItem | null;
  unread_count: number;
  last_message_at: string | null;
}

export interface ConversationsResponse {
  total: number;
  items: ConversationItem[];
}

// Histórico paginado por keyset: `items` mais recentes primeiro; `nextCursor` =
// id para buscar a página anterior (mensagens mais antigas), ou null no fim.
export interface MessagesResponse {
  conversation_id: number;
  items: MessageItem[];
  nextCursor: number | null;
}

export interface ReadResponse {
  conversation_id: number;
  last_read_message_id: number;
  unread_count: number;
}

export interface SimpleMessageResponse {
  message: string;
}
