import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Mission } from '../../../../../api/missions';
import EmptyBox from '../../feedback/emptyBox';
import ErrorBox from '../../feedback/errorBox';

interface Props {
  query: { isLoading: boolean; isError: boolean; data?: { items: Mission[] } };
  // Reusa o renderList do index (mesmos cards de missão, com estrela + Iniciar).
  renderList: (list: Mission[]) => React.ReactNode;
}

// "Rotina do dia" — as missões favoritadas ainda visíveis, com status do dia.
// Executar direto (start → complete). A higiene automática (itens invisíveis somem)
// é do backend; aqui só renderizamos o que vier.
export default function FavoritesSection({ query, renderList }: Props) {
  const { t } = useTranslation();
  const items = query.data?.items ?? [];

  return (
    <View className="bg-white border border-[#f0eded] rounded-[20px] p-3 gap-3">
      <View className="px-1 pt-1">
        <Text className="text-[14px] font-extrabold text-charcoal">{t('missions.favoritesTitle')}</Text>
        <Text className="text-[11px] text-[#999] mt-0.5 leading-[15px]">
          {t('missions.favoritesDescription')}
        </Text>
      </View>

      {query.isLoading ? (
        <View className="py-12 items-center">
          <ActivityIndicator color="#8B1A2B" />
        </View>
      ) : query.isError ? (
        <ErrorBox text={t('missions.errorFavorites')} />
      ) : items.length === 0 ? (
        <EmptyBox text={t('missions.emptyFavorites')} emoji="⭐" />
      ) : (
        renderList(items)
      )}
    </View>
  );
}
