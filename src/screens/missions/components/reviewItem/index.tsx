import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { ToReviewItem } from '../../../../api/missions/missionsApi';
import { parseBackendDate } from '../../../../utils/date';

interface Props {
  item: ToReviewItem;
  onApprove: (slug: string, executorId: string) => void;
  pending: boolean;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#2F7A52',
  medium: '#D4AF37',
  hard: '#9E1B32',
};

function formatRemaining(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Encerrando...';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

export default function ReviewItem({ item, onApprove, pending }: Props) {
  const diffColor = DIFFICULTY_COLOR[item.difficulty ?? ''] ?? '#aaa';
  const targetMs = parseBackendDate(item.completable_at)?.getTime() ?? null;
  const avatarUrl = item.executor.active_avatar?.url ?? item.executor.image ?? null;
  const initial = item.executor.name?.trim().charAt(0).toUpperCase() || '?';

  const [remaining, setRemaining] = useState<number>(() =>
    targetMs != null ? Math.max(0, Math.round((targetMs - Date.now()) / 1000)) : item.remaining_seconds ?? 0,
  );

  useEffect(() => {
    if (targetMs == null) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, Math.round((targetMs - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return (
    <View className="border border-[#f0eded] rounded-[14px] p-4 bg-white">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 flex-row pr-3">
          {/* Avatar do executor */}
          <View className="w-10 h-10 rounded-full bg-[#f4eaea] items-center justify-center overflow-hidden mr-3">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} resizeMode="cover" />
            ) : (
              <Text className="text-[15px] font-extrabold text-primary">{initial}</Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-[14px] font-bold text-[#222]">{item.mission_name}</Text>
            <View className="flex-row items-center flex-wrap gap-x-2 mt-1.5">
              {item.difficulty && (
                <View
                  className="px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${diffColor}18` }}>
                  <Text className="text-[10px] font-bold" style={{ color: diffColor }}>
                    {DIFFICULTY_LABEL[item.difficulty] ?? item.difficulty}
                  </Text>
                </View>
              )}
              <Text className="text-[11px] text-[#999]">
                {item.executor.name}
                {item.executor.rank ? ` · ${item.executor.rank.name}` : ''}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end gap-1">
          <Text className="text-[13px] font-extrabold text-gold">+{item.xp_reward} XP</Text>
          <Text className="text-[11px] font-bold text-[#7a5b00]">⏳ {formatRemaining(remaining)}</Text>
        </View>
      </View>

      {/* Progresso de aprovações */}
      <View className="mt-3 gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold text-[#888]">Aprovações</Text>
          <Text className="text-[12px] font-extrabold text-[#555]">
            {item.approvals_count}/{item.approvals_required}
          </Text>
        </View>
        <View className="flex-row gap-1.5">
          {Array.from({ length: item.approvals_required }).map((_, i) => (
            <View
              key={i}
              className={`flex-1 h-1.5 rounded-full ${
                i < item.approvals_count ? 'bg-laurel' : 'bg-[#ececec]'
              }`}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        disabled={pending}
        activeOpacity={0.85}
        onPress={() => onApprove(item.mission_slug, item.executor.id)}
        className={`mt-3 rounded-[10px] py-2.5 items-center ${pending ? 'bg-laurel/50' : 'bg-laurel'}`}>
        {pending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="text-[13px] font-bold text-white">Aprovar conclusão</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
