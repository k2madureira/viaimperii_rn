import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import { RedeemCodeResponse } from '../../../../../api/codes';
import { useRedeemCode } from '../../../model/mutations/useRedeemCode';

interface Props {
  visible: boolean;
  onClose: () => void;
  // Chamado após resgatar com sucesso (a lista de baús já é invalidada no hook).
  onRedeemed?: (result: RedeemCodeResponse) => void;
}

// Diálogo de resgate de código promocional (§35). Card central (padrão §0.1),
// não é seleção por carrossel — é entrada de texto, então card simples.
export default function CodeRedeemModal({ visible, onClose, onRedeemed }: Props) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<RedeemCodeResponse | null>(null);

  const { mutate: redeem, isPending } = useRedeemCode((data) => {
    setResult(data);
    onRedeemed?.(data);
  });

  useEffect(() => {
    if (visible) {
      setCode('');
      setResult(null);
    }
  }, [visible]);

  const onSubmit = () => {
    const trimmed = code.trim();
    if (!trimmed || isPending) return;
    redeem(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6">
          {result ? (
            <View className="items-center">
              <Text className="text-[17px] font-extrabold text-[#111] text-center">
                {t('codeRedeem.successTitle')}
              </Text>
              <View className="h-2" />
              <Text className="text-[13px] text-[#555] text-center leading-[19px]">
                {t('codeRedeem.successBody', { chest: result.chest.name })}
              </Text>
              {result.remaining_redemptions != null ? (
                <Text className="text-[11px] text-[#999] mt-2">
                  {t('codeRedeem.remaining', { count: result.remaining_redemptions })}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.9}
                className="w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-5">
                <Text className="text-[15px] font-bold text-white">{t('chests.done')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-[17px] font-extrabold text-[#111] text-center">
                {t('codeRedeem.title')}
              </Text>
              <View className="h-1.5" />
              <Text className="text-[12px] text-[#888] text-center leading-[17px]">
                {t('codeRedeem.hint')}
              </Text>

              <View className="h-4" />
              <TextInput
                className="border border-[#e0e0e0] rounded-[10px] px-[14px] py-[13px] text-sm text-[#111] bg-white tracking-[2px] text-center"
                placeholder={t('codeRedeem.placeholder')}
                placeholderTextColor="#bbb"
                autoCapitalize="characters"
                autoCorrect={false}
                value={code}
                onChangeText={setCode}
              />

              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  onPress={onClose}
                  disabled={isPending}
                  activeOpacity={0.85}
                  className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                  <Text className="text-[14px] font-bold text-[#666]">{t('chests.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onSubmit}
                  disabled={!code.trim() || isPending}
                  activeOpacity={0.9}
                  className={`flex-1 rounded-[12px] py-3 items-center ${code.trim() ? 'bg-primary-500' : 'bg-[#d9b3ba]'}`}>
                  {isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-[14px] font-bold text-white">{t('codeRedeem.cta')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
