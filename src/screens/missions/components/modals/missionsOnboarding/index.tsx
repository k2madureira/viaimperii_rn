import React from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

const STEPS = [
  { emoji: '⚔️', key: 'start' },
  { emoji: '📎', key: 'prove' },
  { emoji: '⭐', key: 'xp' },
  { emoji: '🎖️', key: 'rank' },
];

/**
 * Mini-tour exibido na primeira vez que o usuário abre as Missões (F9):
 * iniciar → provar → ganhar XP → subir de patente. Some após o "Entendi"
 * (persistido pelo chamador).
 */
export default function MissionsOnboarding({ visible, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6">
          <Text
            className="text-[18px] font-extrabold text-charcoal text-center"
            style={{ fontFamily: serif }}>
            {t('missions.onboarding.title')}
          </Text>
          <Text className="text-[13px] text-[#777] text-center mt-1.5 leading-[18px]">
            {t('missions.onboarding.subtitle')}
          </Text>

          <View className="gap-3 mt-5">
            {STEPS.map((s, i) => (
              <View key={s.key} className="flex-row items-start gap-3">
                <View className="w-9 h-9 rounded-[10px] bg-primary-500/10 items-center justify-center">
                  <Text className="text-[16px]">{s.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-charcoal">
                    {i + 1}. {t(`missions.onboarding.${s.key}Title`)}
                  </Text>
                  <Text className="text-[12px] text-[#888] leading-[16px] mt-0.5">
                    {t(`missions.onboarding.${s.key}Body`)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            className="bg-primary-500 rounded-[12px] py-3.5 items-center mt-6">
            <Text className="text-[14px] font-bold text-white">{t('missions.onboarding.cta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
