import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../text';

interface Props {
  size?: 'sm' | 'md';
  // Nº do fundador (§34). Quando presente, mostra "Fundador #N".
  number?: number | null;
}

// Selo de Fundador (§34).
//
// Global porque o backend resolve `FeedAuthor.is_founder` em TODO payload de
// autor — feed, comentários, ranking, notificações, menções, busca, fila de
// revisão. Um componente só, usado onde um autor é renderizado.
//
// Best-effort no servidor: quem chama testa `author.is_founder` e simplesmente
// não renderiza — ausência não é estado de erro. Ver [[feedback_always-use-navbar]].
export default function FounderBadge({ size = 'md', number }: Props) {
  const { t } = useTranslation();
  const compact = size === 'sm';

  return (
    <View
      className="flex-row items-center bg-primary-500/15 rounded-full"
      style={{ paddingHorizontal: compact ? 4 : 6, paddingVertical: compact ? 0 : 1 }}>
      <Text
        className="font-bold text-primary-500"
        style={{ fontSize: compact ? 8.5 : 10 }}
        numberOfLines={1}>
        👑 {number != null ? t('founder.badgeNumber', { number }) : t('founder.badge')}
      </Text>
    </View>
  );
}
