import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ShopIcon } from '../../../../../../components/icons';
import { ProfessionTheme } from '../../../../../../utils/color';

interface Props {
  theme: ProfessionTheme;
}

// ── Barra superior: voltar + rótulo + atalho de compra ──────────────────
export default function ProfessionTopBar({ theme }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <View className="flex-row items-center justify-between gap-2">
      <View className="flex-row items-center gap-2 flex-1">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          accessibilityRole="button"
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.soft }}>
          <Text className="text-[18px] font-bold" style={{ color: theme.header }}>‹</Text>
        </TouchableOpacity>
        <Text className="text-[10px] font-bold text-[#b0a0a0] tracking-[2px] uppercase">
          {t('professionMissions.eyebrow')}
        </Text>
      </View>

      {/* Badge dourado → Mercado, para adquirir mais missões de profissão. */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Market')}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={t('professionMissions.buyMore')}
        className="flex-row items-center gap-1.5 rounded-full pl-2.5 pr-3 py-1.5"
        style={{ backgroundColor: '#D4AF37' }}>
        <ShopIcon size={15} color="#6B1221" />
        <Text className="text-[11px] font-extrabold" style={{ color: '#6B1221' }}>
          {t('professionMissions.buyMore')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
