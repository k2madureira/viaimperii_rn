import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ClanDetail } from '../../../../../api/clan';
import { useMyJoinRequests } from '../../../model/queries/useMyJoinRequests';
import { useRequestJoin } from '../../../model/mutations/useRequestJoin';
import { useCancelJoinRequest } from '../../../model/mutations/useCancelJoinRequest';

interface Props {
  clan: ClanDetail;
}

// Ação de ingresso no detalhe de um clã (viewer NÃO-membro). Estados: solicitar,
// pendente (com cancelar) e cheio. Erros do backend (cooldown/já em clã/cap diário)
// são surfados como mensagem.
export default function ClanJoinAction({ clan }: Props) {
  const { t } = useTranslation();
  const myRequestsQuery = useMyJoinRequests();
  const requestM = useRequestJoin();
  const cancelM = useCancelJoinRequest();
  const [error, setError] = useState<string | null>(null);

  const pending = myRequestsQuery.data?.items.find((r) => r.clan.id === clan.id) ?? null;
  const isFull = clan.members_count >= clan.member_cap;

  const onRequest = () => {
    setError(null);
    requestM.mutate(clan.id, {
      onError: (e) => setError(e instanceof Error ? e.message : t('clan.toasts.requestError')),
    });
  };

  const onCancel = () => {
    if (!pending) return;
    setError(null);
    cancelM.mutate(pending.id, {
      onError: (e) => setError(e instanceof Error ? e.message : t('clan.toasts.requestCancelError')),
    });
  };

  // Solicitação pendente → estado informativo + cancelar.
  if (pending) {
    return (
      <View className="bg-white rounded-[16px] p-4 border border-[#f0eded]">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] mr-2.5" />
          <Text className="text-[14px] font-semibold text-[#111] flex-1">
            {t('clan.join.pending')}
          </Text>
        </View>
        <TouchableOpacity
          className="border border-[#e5e5e5] rounded-[12px] py-3 items-center mt-3"
          activeOpacity={0.8}
          disabled={cancelM.isPending}
          onPress={onCancel}>
          {cancelM.isPending ? (
            <ActivityIndicator size="small" color="#9E1B32" />
          ) : (
            <Text className="text-[14px] font-semibold text-[#555]">{t('clan.join.cancel')}</Text>
          )}
        </TouchableOpacity>
        {error ? <Text className="text-[13px] text-red-500 mt-2">{error}</Text> : null}
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
        className={`rounded-[14px] py-3.5 items-center ${isFull ? 'bg-[#ececec]' : 'bg-primary-700'}`}
        activeOpacity={0.85}
        disabled={isFull || requestM.isPending}
        onPress={onRequest}>
        {requestM.isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className={`text-[15px] font-bold ${isFull ? 'text-[#999]' : 'text-white'}`}>
            {isFull ? t('clan.join.full') : t('clan.join.request')}
          </Text>
        )}
      </TouchableOpacity>
      {error ? <Text className="text-[13px] text-red-500 mt-2">{error}</Text> : null}
    </View>
  );
}
