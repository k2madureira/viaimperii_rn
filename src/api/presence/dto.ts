// Status de visibilidade que o usuário pode definir para si mesmo (§Amigos presence).
// O que os OUTROS enxergam pode colapsar em `offline` (ex.: `invisible`) — ver PresenceStatus
// em src/api/friendship/dto.ts. Aqui é sempre o valor real do próprio usuário.
export type SettableStatus = 'available' | 'busy' | 'away' | 'invisible';

export const SETTABLE_STATUSES: SettableStatus[] = ['available', 'busy', 'away', 'invisible'];

export interface MyPresence {
  status: SettableStatus;
  last_seen_at: string | null;
  is_online: boolean;
}
