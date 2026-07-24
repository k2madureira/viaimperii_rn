import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../text';

interface Props {
  size?: 'sm' | 'md';
}

// Selo de Praefectus (líder da legião).
//
// Global porque o backend resolve `FeedAuthor.is_legion_leader` em TODO payload
// de autor — feed, comentários, fila de revisão, leaderboards, notificações,
// menções. Um componente só, usado onde um autor é renderizado.
//
// O campo é best-effort no servidor: uma falha derruba o selo, nunca a
// identidade. Por isso quem chama testa `author.is_legion_leader` e
// simplesmente não renderiza — ausência não é estado de erro.
export default function PraefectusBadge({ size = 'md' }: Props) {
  const { t } = useTranslation();

  const compact = size === 'sm';

  return (
    <View
      className="flex-row items-center bg-accent-500/20 rounded-full"
      style={{ paddingHorizontal: compact ? 4 : 6, paddingVertical: compact ? 0 : 1 }}>
      <Text
        className="font-bold text-[#9a7b1f]"
        style={{ fontSize: compact ? 8.5 : 10 }}
        numberOfLines={1}>
        🎖️ {t('legions.treasury.centurion')}
      </Text>
    </View>
  );
}
