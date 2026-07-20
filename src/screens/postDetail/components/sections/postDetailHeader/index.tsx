import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { FeedItem, ReactionType } from '../../../../../api/feed';
import { HomeNavigationProp } from '../../../../../navigation/HomeStack';
import { useLegions } from '../../../../missions/model/queries/useLegions';
import { FeedCard } from '../../../../dashboard/components/feed';
import { useReactFeed } from '../../../../dashboard/model/mutations/useReactFeed';

interface Props {
  post: FeedItem;
  currentUserId?: string | null;
  onPatch: (patch: (p: FeedItem) => FeedItem) => void;
  onFocusInput: () => void;
}

// Cabeçalho da lista: voltar + o post + título da seção de comentários.
export default function PostDetailHeader({ post, currentUserId, onPatch, onFocusInput }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const legionsQuery = useLegions();
  const reactM = useReactFeed();

  const onReact = (eventId: number, type: ReactionType, currentMine: ReactionType | null) => {
    reactM.mutate({ eventId, type, currentMine });
    onPatch((p) => {
      const removing = currentMine === type;
      const by = { ...p.reactions.by_type };
      if (currentMine) by[currentMine] = Math.max(0, (by[currentMine] ?? 0) - 1);
      if (!removing) by[type] = (by[type] ?? 0) + 1;
      const total = Object.values(by).reduce((s, n) => s + (n ?? 0), 0);
      return { ...p, reactions: { total, by_type: by, mine: removing ? null : type } };
    });
  };

  return (
    <View>
      {/* Voltar (conteúdo, não substitui a Navbar padrão) */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        className="flex-row items-center px-4 py-3">
        <Text className="text-[18px] text-primary-500 mr-1">‹</Text>
        <Text className="text-[14px] font-bold text-primary-500">{t('common.back')}</Text>
      </TouchableOpacity>

      {/* Post */}
      <View className="px-3">
        <FeedCard
          item={post}
          currentUserId={currentUserId}
          legions={legionsQuery.data}
          onReact={onReact}
          onOpenComments={onFocusInput}
        />
      </View>

      {/* Título da seção de comentários */}
      <Text className="text-[13px] font-extrabold text-[#999] uppercase px-4 mt-5 mb-1">
        {t('feed.commentsTitle')}
      </Text>
    </View>
  );
}
