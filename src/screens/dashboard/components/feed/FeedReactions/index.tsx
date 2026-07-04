import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ReactionSummary, ReactionType } from '../../../../../api/feed/feedApi';
import { ReactionIcon } from '../../../../../components/icons';

export const REACTIONS: { type: ReactionType }[] = [
  { type: 'like' },
  { type: 'clap' },
  { type: 'fire' },
  { type: 'salute' },
];

// Glifo de uma reação (SVG). Sem reação ainda (`null`) → mostra o "curtir" como
// afordância padrão do botão.
export function ReactionGlyph({ type, size }: { type: ReactionType | null; size: number }) {
  return <ReactionIcon type={type ?? 'like'} size={size} />;
}

// Cluster de emojis + total (estilo LinkedIn, exibido acima das ações).
export function ReactionCluster({ reactions }: { reactions: ReactionSummary }) {
  if (reactions.total <= 0) return null;
  const present = REACTIONS.filter((r) => (reactions.by_type[r.type] ?? 0) > 0);
  return (
    <View className="flex-row items-center">
      <View className="flex-row">
        {present.slice(0, 3).map((r, i) => (
          <View
            key={r.type}
            className="w-5 h-5 rounded-full bg-white items-center justify-center border border-[#f0eded]"
            style={{ marginLeft: i === 0 ? 0 : -6 }}>
            <ReactionGlyph type={r.type} size={13} />
          </View>
        ))}
      </View>
      <Text className="text-[12px] text-[#888] ml-1.5">{reactions.total}</Text>
    </View>
  );
}

interface Props {
  reactions: ReactionSummary;
  onReact: (type: ReactionType) => void;
}

/**
 * Botão de reação no estilo LinkedIn:
 * - toque rápido → curte (ou remove, se já reagiu);
 * - toque longo → abre o "dropup" flutuante com as 4 reações;
 * - selecionar uma reação aplica e fecha o dropup.
 */
export default function FeedReactions({ reactions, onReact }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const mine = reactions.mine;

  const pick = (type: ReactionType) => {
    setOpen(false);
    onReact(type);
  };

  const onTrigger = () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (mine) {
      onReact(mine); // já reagiu → toque remove a reação
      return;
    }
    setOpen(true); // sem reação → abre o dropup para escolher
  };

  return (
    <View className="flex-1" style={{ overflow: 'visible' }}>
      {open && (
        <>
          {/* Backdrop p/ fechar ao tocar fora (dentro do card) */}
          <Pressable onPress={() => setOpen(false)} style={[StyleSheet.absoluteFill, { zIndex: 40 }]} />
          {/* Dropup flutuante de reações */}
          <View
            className="absolute flex-row items-center bg-white rounded-full px-1.5 py-1.5 border border-[#eadfdf]"
            style={{
              bottom: 46,
              left: 4,
              zIndex: 50,
              elevation: 8,
              shadowColor: '#000',
              shadowOpacity: 0.14,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            }}>
            {REACTIONS.map(({ type }) => (
              <TouchableOpacity
                key={type}
                onPress={() => pick(type)}
                activeOpacity={0.6}
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  mine === type ? 'bg-primary-500/10' : ''
                }`}>
                <ReactionGlyph type={type} size={22} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        onPress={onTrigger}
        onLongPress={() => setOpen(true)}
        delayLongPress={180}
        activeOpacity={0.7}
        className="flex-row items-center justify-center gap-2 py-2 rounded-[10px]">
        <ReactionGlyph type={mine} size={16} />
        <Text className={`text-[13px] font-bold ${mine ? 'text-primary-500' : 'text-[#666]'}`}>
          {mine ? t(`feed.reactions.${mine}`) : t('feed.react')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
