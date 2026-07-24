import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import { CoinAmount, TreasuryIcon } from '../../../../../components/icons';
import { LegionTreasuryApiError } from '../../../../../api/legionTreasury';
import { COIN_LADDER, CoinDenom } from '../../../../../utils/coins';

interface Props {
  visible: boolean;
  legionName: string;
  walletBalance: number | undefined;
  pending?: boolean;
  error?: unknown;
  onConfirm: (amount: number, unit: CoinDenom) => void;
  onClose: () => void;
}

// Tributo ao Cofre da Legião — padrão do `LegionSelectModal` (§0.1): card central
// sobre `bg-black/60`, botão primário full-width e overlay de confirmação
// `absolute inset-0`. Nunca Alert nativo.
export default function DonateModal({
  visible,
  legionName,
  walletBalance,
  pending = false,
  error,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<CoinDenom>('denarius');
  const [confirming, setConfirming] = useState(false);

  // Reabrir o modal sempre parte de um estado limpo.
  useEffect(() => {
    if (!visible) return;
    setAmount('');
    setUnit('denarius');
    setConfirming(false);
  }, [visible]);

  // 422 é erro de campo: o contrato manda mostrar INLINE no input (spec §6.2),
  // por isso a mutation não dispara Toast nesse caso.
  const fieldError =
    error instanceof LegionTreasuryApiError && error.status === 422 ? error.message : null;

  const parsed = Number.parseInt(amount, 10);
  const isValid = Number.isFinite(parsed) && parsed > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Toque no backdrop fecha; bloqueado enquanto a doação está em voo para
          não descartar o modal no meio da requisição. */}
      <Pressable
        onPress={pending ? undefined : onClose}
        className="flex-1 bg-black/60 items-center justify-center px-6">
        {/* Engole o toque para que tocar no card não feche o modal. */}
        <Pressable onPress={() => {}} className="w-full bg-white rounded-[20px] p-6 items-center">
          <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase">
            {t('legions.treasury.donate')}
          </Text>

          <View className="w-16 h-16 rounded-full bg-primary-500/10 items-center justify-center mt-4">
            <TreasuryIcon size={30} color="#9E1B32" />
          </View>

          <Text
            className="text-[19px] font-extrabold text-[#111] text-center mt-3"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {legionName}
          </Text>
          <Text className="text-[12px] text-[#888] text-center mt-1.5 leading-[17px]">
            {t('legions.treasury.donateHint')}
          </Text>

          {/* Saldo pessoal do doador */}
          {walletBalance != null && (
            <View className="flex-row items-center gap-2 bg-[#faf7f7] rounded-[10px] px-3 py-2 mt-4">
              <Text className="text-[11px] text-[#888]">{t('legions.treasury.yourBalance')}</Text>
              <CoinAmount atomic={walletBalance} size={13} compact />
            </View>
          )}

          {/* Valor */}
          <TextInput
            value={amount}
            onChangeText={setAmount}
            editable={!pending}
            keyboardType="number-pad"
            placeholder={t('legions.treasury.amountPlaceholder')}
            placeholderTextColor="#bbb"
            className={`w-full border rounded-[12px] px-4 mt-4 text-[16px] text-[#111] text-center ${
              fieldError ? 'border-primary-500' : 'border-[#e0dada]'
            }`}
            style={{ paddingVertical: Platform.OS === 'ios' ? 13 : 10 }}
          />

          {/* Denominação (unit) */}
          <View className="flex-row gap-2 w-full mt-3">
            {COIN_LADDER.map(({ name }) => (
              <TouchableOpacity
                key={name}
                onPress={() => setUnit(name)}
                disabled={pending}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityState={{ selected: unit === name }}
                className={`flex-1 rounded-[10px] py-2.5 items-center border ${
                  unit === name ? 'bg-primary-500 border-primary-500' : 'border-[#e0dada]'
                }`}>
                <Text
                  className={`text-[12px] font-bold ${unit === name ? 'text-white' : 'text-[#666]'}`}>
                  {t(`coins.${name}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {fieldError && (
            <Text className="text-[11.5px] text-primary-500 mt-2 text-center leading-[16px]">
              {fieldError}
            </Text>
          )}

          {/* Ações */}
          <TouchableOpacity
            onPress={() => setConfirming(true)}
            disabled={pending || !isValid}
            activeOpacity={0.9}
            className={`w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-6 ${
              !isValid ? 'opacity-35' : ''
            }`}>
            <Text className="text-[15px] font-bold text-white">
              {t('legions.treasury.donateCta')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} disabled={pending} className="mt-3">
            <Text className="text-[12px] text-[#aaa]">{t('common.cancel')}</Text>
          </TouchableOpacity>
        </Pressable>

        {/* Confirmação temática (substitui o Alert nativo). Toque fora volta ao
            formulário — não fecha o modal inteiro. */}
        {confirming && (
          <Pressable
            onPress={pending ? undefined : () => setConfirming(false)}
            className="absolute inset-0 bg-black/50 items-center justify-center px-8">
            <Pressable onPress={() => {}} className="w-full bg-white rounded-[18px] p-6">
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-primary-500/10 items-center justify-center mb-3">
                  <TreasuryIcon size={24} color="#9E1B32" />
                </View>
                <Text
                  className="text-[18px] font-extrabold text-[#111] text-center"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {t('legions.treasury.donateConfirmTitle')}
                </Text>
              </View>

              <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
                {t('legions.treasury.donateConfirmDesc', {
                  amount: parsed,
                  unit: t(`coins.${unit}`),
                  name: legionName,
                })}
              </Text>

              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  onPress={() => setConfirming(false)}
                  disabled={pending}
                  activeOpacity={0.85}
                  className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                  <Text className="text-[14px] font-bold text-[#666]">{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onConfirm(parsed, unit)}
                  disabled={pending}
                  activeOpacity={0.9}
                  className="flex-1 bg-primary-500 rounded-[12px] py-3 items-center">
                  {pending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-[14px] font-bold text-white">{t('common.confirm')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}
