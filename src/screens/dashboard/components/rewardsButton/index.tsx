import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { GiftIcon } from '../../../../components/icons';
import { HomeNavigationProp } from '../../../../navigation/HomeStack';
import { useAuth } from '../../../../contexts/AuthContext';
import { useDailyRewards } from '../../../rewards/model/queries/useDailyRewards';

/**
 * Botão de presente (colorido) no topo da Home — abre a tela de Prêmios.
 * Badge = total de unidades resgatáveis agora (soma de `claimable`).
 */
export default function RewardsButton() {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const { user } = useAuth();
  const query = useDailyRewards(!!user);
  const claimable = (query.data ?? []).reduce((sum, r) => sum + (r.claimable ?? 0), 0);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Rewards')}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={t('rewards.title')}
      className="w-9 h-9 items-center justify-center">
      <GiftIcon size={24} />
      {claimable > 0 && (
        <View
          className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-primary-500 items-center justify-center px-1"
          style={{ borderWidth: 1.5, borderColor: '#fff' }}>
          <Text className="text-[9px] font-extrabold text-white leading-none">
            {claimable > 99 ? '99+' : claimable}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
