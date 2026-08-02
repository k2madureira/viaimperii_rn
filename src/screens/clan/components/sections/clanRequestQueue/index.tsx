import React, { useState } from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { useClanJoinRequests } from '../../../model/queries/useClanJoinRequests';
import { useRespondJoinRequest } from '../../../model/mutations/useRespondJoinRequest';
import { ClanRequestRow } from '../../cards';

interface Props {
  clanId: number;
  // Só oficiais (capitão+ = rank_level ≥ 2) veem/gerenciam a fila.
  canManage: boolean;
}

// Fila de solicitações de ingresso do clã (visão do oficial). Só renderiza quando
// há solicitações pendentes — some quando a fila esvazia.
export default function ClanRequestQueue({ clanId, canManage }: Props) {
  const { t } = useTranslation();
  const queueQuery = useClanJoinRequests(clanId, canManage);
  const respondM = useRespondJoinRequest();
  const [actingId, setActingId] = useState<number | null>(null);

  const items = queueQuery.data?.items ?? [];
  if (!canManage || items.length === 0) return null;

  const respond = (requestId: number, accept: boolean) => {
    setActingId(requestId);
    respondM.mutate(
      { requestId, accept },
      { onSettled: () => setActingId(null) },
    );
  };

  return (
    <View className="bg-white rounded-[20px] p-5">
      <Text className="text-[13px] font-bold text-[#111] tracking-[1px] uppercase mb-1">
        {t('clan.requests.title', { count: items.length })}
      </Text>
      <View>
        {items.map((r) => (
          <ClanRequestRow
            key={r.id}
            request={r}
            pending={respondM.isPending && actingId === r.id}
            onAccept={() => respond(r.id, true)}
            onDecline={() => respond(r.id, false)}
          />
        ))}
      </View>
    </View>
  );
}
