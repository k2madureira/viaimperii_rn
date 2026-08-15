import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { GroupKind } from '../../../../api/chat';

// Abre (ou cria, lazy) a sala de grupo do usuário — legião ou clã. Get-or-create
// no backend, então modelado como query. 403 se o usuário não está no grupo
// (sem legião/clã) — nesse caso o consumidor mostra o estado vazio.
export function useGroupConversation(kind: GroupKind, enabled = true) {
  return useQuery({
    queryKey: ['chat', 'group', kind],
    enabled,
    queryFn: () =>
      kind === 'legion' ? viaimperiiApi.chat.openLegion() : viaimperiiApi.chat.openClan(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
