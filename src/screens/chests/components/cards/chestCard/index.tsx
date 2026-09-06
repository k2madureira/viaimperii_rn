import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { ChestIcon } from '../../../../../components/icons';
import { UserChestItem } from '../../../../../api/chests';

interface Props {
  item: UserChestItem;
  onPress: () => void;
}

// Linha de baú na lista "Meus baús" (§35). Fechado → destaque dourado + CTA abrir;
// aberto → neutro + CTA ver recompensas.
export default function ChestCard({ item, onPress }: Props) {
  const { t } = useTranslation();
  const opened = item.status === 'opened';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-row items-center rounded-[14px] p-4 border ${
        opened ? 'bg-white border-[#eee]' : 'bg-[#f6f1e7] border-[#e6d9bf]'
      }`}>
      <View
        className={`w-11 h-11 rounded-[12px] items-center justify-center ${
          opened ? 'bg-[#f2f2f2]' : 'bg-[#efe2c4]'
        }`}>
        <ChestIcon size={24} color={opened ? '#999' : '#8B1A2B'} open={opened} />
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-[15px] font-bold text-[#111]" numberOfLines={1}>
          {item.chest.name}
        </Text>
        {item.chest.description ? (
          <Text className="text-[12px] text-[#777] mt-0.5" numberOfLines={2}>
            {item.chest.description}
          </Text>
        ) : null}
        <Text
          className={`text-[11px] font-semibold mt-1 ${opened ? 'text-[#999]' : 'text-[#8B1A2B]'}`}>
          {opened ? t('chests.statusOpened') : t('chests.statusUnopened')}
        </Text>
      </View>

      <View className="ml-2 items-end">
        <Text className={`text-[13px] font-semibold ${opened ? 'text-[#999]' : 'text-[#8B1A2B]'}`}>
          {opened ? t('chests.viewCta') : t('chests.openCta')}
        </Text>
        <Text className="text-[18px] text-[#ccc] leading-none mt-0.5">›</Text>
      </View>
    </TouchableOpacity>
  );
}
