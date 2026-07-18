import React, { useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { FireIcon, ShieldIcon } from '../../../../../components/icons';
import { LoginStreak } from '../../../../../api/auth/authApi';
import { useAuth } from '../../../../../contexts/AuthContext';
import AnchoredPopover, { Anchor } from '../../feed/AnchoredPopover';
import { useStreak } from '../../../model/queries/useStreak';
import { useWallet } from '../../../model/queries/useWallet';
import { useBuyStreakShield } from '../../../model/mutations/useBuyStreakShield';
import BuyShieldModal from '../../modals/buyShieldModal';

interface Props {
  streak: LoginStreak;
}

// Botão de streak no topo direito da tela: chama com a porcentagem dentro,
// toque abre um tooltip com os detalhes (dias, bônus, próxima meta, escudos).
export default function StreakButton({ streak }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.user_id;
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [shieldModal, setShieldModal] = useState(false);
  // Saldo insuficiente detectado numa tentativa (backend responde 422): trava o botão.
  const [lowBalance, setLowBalance] = useState(false);

  const isOpen = anchor !== null;
  // Query dedicada só busca quando o tooltip abre (reflete compra sem re-logar).
  const streakQuery = useStreak(userId, isOpen);
  const wallet = useWallet(shieldModal);
  const buyShield = useBuyStreakShield(userId);

  // Escudos: prioriza a query fresca; cai para o snapshot do login (undefined = 0).
  const shields = streakQuery.data?.streak_shields ?? streak.streak_shields ?? 0;
  const maxShields = streakQuery.data?.max_streak_shields ?? streak.max_streak_shields ?? 0;
  const isMaxed = maxShields > 0 && shields >= maxShields;

  const open = () =>
    anchorRef.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y, width: w, height: h }));

  const openShieldModal = () => {
    setLowBalance(false);
    setShieldModal(true);
  };

  const confirmBuy = () => {
    buyShield.mutate(undefined, {
      onSuccess: () => setShieldModal(false),
      onError: (error) => {
        // 422 = saldo insuficiente (contrato real): mantém o modal e trava o botão.
        if ((error as { status?: number })?.status === 422) setLowBalance(true);
        else setShieldModal(false);
      },
    });
  };

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <TouchableOpacity
          onPress={open}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.streakDays', { count: streak.current_streak })}
          className="w-9 h-9 items-center justify-center">
          <FireIcon size={30} />
          <View className="absolute inset-0 items-center justify-center" style={{ top: 4 }}>
            <Text className="text-[8px] font-extrabold text-white">{streak.bonus_pct}%</Text>
          </View>
        </TouchableOpacity>
      </View>

      <AnchoredPopover anchor={anchor} onClose={() => setAnchor(null)} width={264} align="right">
        <View className="p-4 gap-3">
          {/* Cabeçalho: dias + bônus atual */}
          <View className="flex-row items-center">
            <FireIcon size={30} />
            <View className="ml-2 flex-1">
              <Text className="text-[15px] font-extrabold text-charcoal">
                {t('dashboard.streakDays', { count: streak.current_streak })}
              </Text>
              <Text className="text-[11px] text-[#999]">
                {t('dashboard.streakRecord', { count: streak.longest_streak })}
              </Text>
            </View>
            <View className="bg-accent-500/15 rounded-full px-2.5 py-1">
              <Text className="text-[12px] font-extrabold text-[#9a7b1f]">+{streak.bonus_pct}%</Text>
            </View>
          </View>

          {/* Linha dos últimos 7 dias */}
          <WeekRow current={streak.current_streak} />

          {/* Próximo marco / bônus máximo */}
          <Text className="text-[12px] text-[#777] leading-[17px]">
            {streak.is_max_bonus
              ? t('dashboard.streakMax', { pct: streak.bonus_pct })
              : t('dashboard.streakNext', {
                  count: Math.max(1, streak.next_milestone - streak.current_streak),
                  pct: streak.next_milestone,
                })}
          </Text>

          {/* Escudos de ofensiva: contagem + compra */}
          <View className="border-t border-[#f0eaea] pt-3 mt-1">
            <View className="flex-row items-center">
              <ShieldIcon size={18} color="#4a5a8a" />
              <Text className="text-[13px] font-bold text-charcoal ml-1.5 flex-1">
                {t('dashboard.streakShield.count', { have: shields, max: maxShields })}
              </Text>
              {isMaxed ? (
                <Text className="text-[11px] font-bold text-[#9a7b1f]">
                  {t('dashboard.streakShield.maxed')}
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={openShieldModal}
                  activeOpacity={0.85}
                  className="bg-primary-500 rounded-full px-3 py-1.5">
                  <Text className="text-[12px] font-bold text-white">
                    {t('dashboard.streakShield.buy')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </AnchoredPopover>

      <BuyShieldModal
        visible={shieldModal}
        shields={shields}
        maxShields={maxShields}
        pending={buyShield.isPending}
        balanceAtomic={wallet.data?.general_balance}
        disabled={lowBalance}
        onConfirm={confirmBuy}
        onClose={() => setShieldModal(false)}
      />
    </>
  );
}

// Linha dos últimos 7 dias: as últimas `current` células (até 7) ficam acesas,
// sendo a mais à direita = hoje (já garantido no login).
function WeekRow({ current }: { current: number }) {
  const DAYS = 7;
  const filled = Math.min(current, DAYS);
  return (
    <View className="flex-row justify-between">
      {Array.from({ length: DAYS }).map((_, i) => {
        const on = i >= DAYS - filled;
        const isToday = i === DAYS - 1;
        return (
          <View
            key={i}
            className="w-7 h-7 rounded-[8px] items-center justify-center"
            style={{
              backgroundColor: on ? '#F6E6C0' : '#f2efef',
              borderWidth: isToday ? 1.5 : 0,
              borderColor: '#D4AF37',
            }}>
            {on ? <FireIcon size={16} /> : <View className="w-1.5 h-1.5 rounded-full bg-[#d3cccc]" />}
          </View>
        );
      })}
    </View>
  );
}
