import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { Mission } from '../../../../../api/missions/missionsApi';
import { ShieldIcon } from '../../../../../components/icons';
import MissionSkeleton from '../../skeletons/missionSkeleton';
import ErrorBox from '../../feedback/errorBox';
import ActiveGoldGlow from '../../effects/activeGoldGlow';

interface Props {
  missions: Mission[];
  isLoading: boolean;
  isError: boolean;
  open: boolean;
  onToggle: () => void;
  renderItem: (m: Mission) => React.ReactNode;
}

// ── C4: "Ativas" vira card colapsável com badge (só quando há ativas),
// acima da lista de Disponíveis, que passa a ser o foco da tela. ──────────
export default function ActiveMissionsCard({
  missions,
  isLoading,
  isError,
  open,
  onToggle,
  renderItem,
}: Props) {
  const { t } = useTranslation();
  if (missions.length === 0) return null;

  return (
    <View
      className="rounded-[20px] overflow-hidden bg-white"
      style={{ borderWidth: 1, borderColor: '#ecdcac' }}>
      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t('missions.activeMissions')}
        onPress={onToggle}
        className="flex-row items-center justify-between px-4 py-3.5">
        <View className="flex-row items-center gap-2">
          <ShieldIcon size={16} color="#9a7b1f" />
          <Text className="text-[14px] font-extrabold text-charcoal">
            {t('missions.activeMissions')}
          </Text>
          <View className="bg-primary-500 rounded-full min-w-[20px] px-1.5 py-0.5 items-center">
            <Text className="text-[11px] font-extrabold text-white leading-none">
              {missions.length > 99 ? '99+' : missions.length}
            </Text>
          </View>
        </View>
        <Text className="text-[12px] text-primary-500">{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <View className="px-3 pb-3 gap-3">
          {isLoading ? (
            <MissionSkeleton count={2} />
          ) : isError ? (
            <ErrorBox text={t('missions.errorInProgress')} />
          ) : (
            <View className="gap-3">{missions.map(renderItem)}</View>
          )}
        </View>
      )}

      {/* Glow dourado pulsante — só com o card FECHADO, para chamar atenção
          sem manter animação/medição rodando durante a interação (evita travar). */}
      {!open && <ActiveGoldGlow radius={20} />}
    </View>
  );
}
