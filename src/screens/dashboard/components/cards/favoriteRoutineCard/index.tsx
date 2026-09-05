import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Mission } from '../../../../../api/missions';
import { MASTERY_ICONS, StarIcon } from '../../../../../components/icons';

interface Props {
  // Favoritas do dia (briefing.favorite_missions, já capadas em 10 no backend).
  missions?: Mission[];
  onSeeAll: () => void;
}

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';
const ROWS = 4; // mostra as mais recentes; "Ver todas" abre a lista completa.

function resolveSpecialtyIcon(name?: string | null) {
  if (!name) return undefined;
  const key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return MASTERY_ICONS[key];
}

const STATUS_COLOR: Record<string, string> = {
  available: '#c9c2c2',
  in_progress: '#8B1A2B',
  pending_review: '#9a7b1f',
  completed: '#2F7A52',
};

/**
 * "Sua rotina do dia" — atalho para as missões favoritadas na Home. Não executa a
 * missão aqui (o ciclo start → complete vive na tela de Missões): tocar leva pra lá.
 * Só aparece quando há favoritas visíveis.
 */
export default function FavoriteRoutineCard({ missions, onSeeAll }: Props) {
  const { t } = useTranslation();
  const list = missions ?? [];
  if (list.length === 0) return null;

  return (
    <View className="bg-white border border-[#f0eded] rounded-[18px] p-4 gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <StarIcon size={16} filled color="#D4AF37" />
          <Text className="text-[15px] font-extrabold text-charcoal" style={{ fontFamily: serif }}>
            {t('dashboard.favoriteRoutine.title')}
          </Text>
        </View>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.8} accessibilityRole="button">
          <Text className="text-[12px] font-bold text-primary-500">
            {t('dashboard.favoriteRoutine.seeAll')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="gap-2">
        {list.slice(0, ROWS).map((m) => {
          const Icon = resolveSpecialtyIcon(m.specialty_name);
          const color = m.specialty_color ?? '#6B1221';
          const done = m.status === 'completed';
          return (
            <TouchableOpacity
              key={m.id}
              onPress={onSeeAll}
              activeOpacity={0.8}
              accessibilityRole="button"
              className="flex-row items-center gap-2.5">
              <View
                className="w-8 h-8 rounded-[9px] items-center justify-center"
                style={{ backgroundColor: `${color}1A` }}>
                {Icon ? <Icon size={16} color={color} /> : <Text className="text-[13px]">⚔️</Text>}
              </View>
              <Text
                className={`flex-1 text-[13px] font-semibold ${done ? 'text-[#9a9a9a] line-through' : 'text-[#1c1c1c]'}`}
                numberOfLines={1}>
                {m.name}
              </Text>
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[m.status] ?? '#c9c2c2' }}
                accessibilityLabel={t(`dashboard.favoriteRoutine.status.${m.status}`, {
                  defaultValue: m.status,
                })}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {list.length > ROWS && (
        <Text className="text-[11px] text-[#999]">
          {t('dashboard.favoriteRoutine.more', { count: list.length - ROWS })}
        </Text>
      )}
    </View>
  );
}
