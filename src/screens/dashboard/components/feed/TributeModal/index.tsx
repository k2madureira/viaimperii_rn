import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import { CoinAmount, DenariusCoin } from '../../../../../components/icons';
import {
  TRIBUTE_MAX,
  TRIBUTE_MIN,
  TRIBUTE_PRESETS,
  TributeApiError,
  TributeResult,
} from '../../../../../api/tributes';

interface Props {
  visible: boolean;
  recipientName: string;
  alreadyTributed?: boolean;
  walletBalance?: number;
  pending?: boolean;
  error?: unknown;
  result?: TributeResult | null; // preenchido → mostra o overlay de sucesso
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

// Envio de tributo — padrão obrigatório do `LegionSelectModal` (§0.1): card
// central sobre `bg-black/60`, carrossel com setas `‹ ›` e a moeda ao centro,
// dots de posição, botão primário full-width e overlay `absolute inset-0`.
// Nunca Alert nativo.
export default function TributeModal({
  visible,
  recipientName,
  alreadyTributed = false,
  walletBalance,
  pending = false,
  error,
  result,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  // Valor livre: quando preenchido, tem precedência sobre o preset selecionado.
  const [custom, setCustom] = useState('');

  // Reabrir sempre parte de um estado limpo (inclusive após um envio anterior).
  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    setCustom('');
  }, [visible]);

  const status = error instanceof TributeApiError ? error.status : 0;
  // 422 tem dois motivos no mesmo status (faixa vs. saldo). O backend não expõe
  // `error_code`, então a mensagem dele é a fonte — exibida inline, sem
  // reescrever, para não afirmar o motivo errado.
  const fieldError = status === 422 ? (error as TributeApiError).message : null;
  const dailyLimitReached = status === 429;

  const amount = useMemo(() => {
    const trimmed = custom.trim();
    if (!trimmed) return TRIBUTE_PRESETS[index];
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [custom, index]);

  const inRange = Number.isFinite(amount) && amount >= TRIBUTE_MIN && amount <= TRIBUTE_MAX;
  const canSend = inRange && !pending && !dailyLimitReached;

  const go = (dir: -1 | 1) => {
    if (pending) return;
    setCustom('');
    setIndex((i) => (i + dir + TRIBUTE_PRESETS.length) % TRIBUTE_PRESETS.length);
  };

  const remainingToday =
    result && result.daily_limit != null ? result.daily_limit - result.tributes_today : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop fecha, exceto com o envio em voo. */}
      <Pressable
        onPress={pending ? undefined : onClose}
        className="flex-1 bg-black/60 items-center justify-center px-6">
        {/* Engole o toque para que tocar no card não feche o modal. */}
        <Pressable onPress={() => {}} className="w-full bg-white rounded-[20px] p-6 items-center">
          <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase">
            {t('tributes.title')}
          </Text>
          <Text className="text-[12px] text-[#888] text-center mt-1.5 leading-[17px]">
            {t('tributes.subtitle', { name: recipientName })}
          </Text>
          {alreadyTributed && (
            <View className="bg-accent-500/15 rounded-full px-2.5 py-0.5 mt-2">
              <Text className="text-[11px] font-bold text-[#9a7b1f]">
                {t('tributes.alreadyTributed')}
              </Text>
            </View>
          )}

          {/* Carrossel de presets: setas + moeda central */}
          <View className="flex-row items-center justify-between w-full mt-4">
            <TouchableOpacity
              onPress={() => go(-1)}
              disabled={pending}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              className="w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea]">
              <Text className="text-[22px] text-primary-500 leading-none">‹</Text>
            </TouchableOpacity>

            <View className="flex-1 items-center px-2">
              <View className="w-28 h-28 rounded-full bg-[#faf7f7] items-center justify-center">
                <DenariusCoin size={54} />
                <Text className="text-[20px] font-extrabold text-[#111] mt-1.5">
                  {TRIBUTE_PRESETS[index]}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => go(1)}
              disabled={pending}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              className="w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea]">
              <Text className="text-[22px] text-primary-500 leading-none">›</Text>
            </TouchableOpacity>
          </View>

          <Text
            className="text-[16px] font-extrabold text-[#111] text-center mt-3"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {t('tributes.preset', { amount: TRIBUTE_PRESETS[index] })}
          </Text>

          {/* Indicadores de posição */}
          <View className="flex-row gap-1.5 mt-3">
            {TRIBUTE_PRESETS.map((preset, i) => (
              <View
                key={preset}
                className={`h-1.5 rounded-full ${
                  i === index && !custom.trim() ? 'w-4 bg-primary-500' : 'w-1.5 bg-[#e0dada]'
                }`}
              />
            ))}
          </View>

          {/* Saldo pessoal */}
          {walletBalance != null && (
            <View className="flex-row items-center gap-2 bg-[#faf7f7] rounded-[10px] px-3 py-2 mt-4">
              <Text className="text-[11px] text-[#888]">{t('tributes.yourBalance')}</Text>
              <CoinAmount atomic={walletBalance} size={13} compact />
            </View>
          )}

          {/* Valor livre */}
          <TextInput
            value={custom}
            onChangeText={setCustom}
            editable={!pending}
            keyboardType="number-pad"
            placeholder={t('tributes.custom')}
            placeholderTextColor="#bbb"
            className={`w-full border rounded-[12px] px-4 mt-4 text-[16px] text-[#111] text-center ${
              fieldError || (custom.trim() && !inRange) ? 'border-primary-500' : 'border-[#e0dada]'
            }`}
            style={{ paddingVertical: Platform.OS === 'ios' ? 13 : 10 }}
          />

          {(fieldError || (custom.trim() !== '' && !inRange)) && (
            <Text className="text-[11.5px] text-primary-500 mt-2 text-center leading-[16px]">
              {fieldError ?? t('tributes.errors.range')}
            </Text>
          )}

          {dailyLimitReached && (
            <View className="bg-accent-500/15 rounded-[10px] px-3 py-2.5 mt-3 w-full">
              <Text className="text-[12px] text-[#9a7b1f] leading-[17px] text-center">
                {t('tributes.errors.dailyLimit')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => onConfirm(amount)}
            disabled={!canSend}
            activeOpacity={0.9}
            className={`w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-6 ${
              !canSend ? 'opacity-35' : ''
            }`}>
            {pending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[15px] font-bold text-white">{t('tributes.confirm')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} disabled={pending} className="mt-3">
            <Text className="text-[12px] text-[#aaa]">{t('common.cancel')}</Text>
          </TouchableOpacity>
        </Pressable>

        {/* Confirmação de envio (substitui o Alert nativo). */}
        {result && (
          <Pressable
            onPress={onClose}
            className="absolute inset-0 bg-black/50 items-center justify-center px-8">
            <Pressable onPress={() => {}} className="w-full bg-white rounded-[18px] p-6">
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-accent-500/15 items-center justify-center mb-3">
                  <DenariusCoin size={26} />
                </View>
                <Text
                  className="text-[18px] font-extrabold text-[#111] text-center"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {t('tributes.sent')}
                </Text>
              </View>

              <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
                {t('tributes.sentDetail', {
                  amount: result.coins_sent_display,
                  name: recipientName,
                })}
              </Text>

              <View className="bg-[#faf7f7] rounded-[10px] px-3 py-2.5 mt-3">
                <Text className="text-[12px] text-[#777] text-center leading-[18px]">
                  {t('tributes.balanceAfter', { amount: result.sender_balance_display })}
                </Text>
                {remainingToday != null && (
                  <Text className="text-[12px] text-[#777] text-center leading-[18px]">
                    {t('tributes.remainingToday', { count: remainingToday })}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.9}
                className="w-full bg-primary-500 rounded-[12px] py-3 items-center mt-5">
                <Text className="text-[14px] font-bold text-white">{t('common.close')}</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}
