import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../../components/text';

// Estado do QG para quem ainda não tem legião.
//
// A legião é atribuída na conclusão da PRIMEIRA missão (§14), então antes disso
// a sala fica trancada — não é erro nem tela vazia, é progressão pendente. Por
// isso a copy explica o que destrava, em vez de só informar a ausência.
export default function NoLegionState() {
  const { t } = useTranslation();

  return (
    <View className="bg-white rounded-[16px] border border-[#f0eded] px-5 py-8 items-center gap-3">
      <View className="w-14 h-14 rounded-full bg-[#f4eaea] items-center justify-center">
        <Text className="text-[26px]">🔒</Text>
      </View>

      <Text className="text-[15px] font-extrabold text-[#111] text-center">
        {t('legions.hqLockedTitle')}
      </Text>

      <Text className="text-[12.5px] text-[#888] text-center leading-[18px]">
        {t('legions.hqLockedBody')}
      </Text>
    </View>
  );
}
