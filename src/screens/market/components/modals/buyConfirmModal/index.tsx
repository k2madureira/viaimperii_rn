import React from 'react';
import { ActivityIndicator, Image, Modal, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Rect } from 'react-native-svg';
import { CoinAmount } from '../../../../../components/icons';
import { Profession } from '../../../../../api/professions';

const OUTLINE = '#d6c9c9';

// Ícone genérico de profissão (pasta/maleta) quando não há icon_url.
function ProfessionGlyph({ size = 38, color = '#9E1B32' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={7} width={18} height={13} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M3 12h18" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

interface Props {
  profession: Profession | null;
  balance: number; // saldo total disponível na carteira
  buying: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

// Modal padrão de confirmação de compra de profissão: mostra o saldo disponível,
// o valor a debitar e o saldo restante antes de confirmar.
export default function BuyConfirmModal({ profession, balance, buying, onConfirm, onClose }: Props) {
  const { t } = useTranslation();
  const price = profession ? profession.effective_price ?? profession.price : 0;
  const remaining = Math.max(0, balance - price);

  return (
    <Modal
      visible={profession != null}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6">
          {/* Cabeçalho: imagem da profissão à esquerda, informações à direita */}
          <View className="flex-row items-center gap-4">
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: OUTLINE,
                overflow: 'hidden',
                backgroundColor: '#faf6f6',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {profession?.icon_url ? (
                <Image source={{ uri: profession.icon_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <ProfessionGlyph />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-bold text-primary-500 uppercase tracking-[1px]">
                {t('market.professions.confirmTitle')}
              </Text>
              {profession && (
                <Text
                  className="text-[17px] font-extrabold text-charcoal mt-0.5"
                  style={{ fontFamily: serif }}
                  numberOfLines={2}>
                  {profession.name}
                </Text>
              )}
              {profession && (
                <Text className="text-[12px] font-semibold text-[#888] mt-0.5">
                  {t('market.professions.missionCount', { n: profession.mission_count })}
                </Text>
              )}
            </View>
          </View>

          {/* Resumo do débito */}
          <View className="bg-[#faf6f6] rounded-[14px] p-4 mt-5 gap-3">
            <Row label={t('market.professions.walletBalance')}>
              <CoinAmount atomic={balance} size={14} />
            </Row>
            <View className="h-px bg-[#eee2e2]" />
            <Row label={t('market.professions.toDebit')}>
              <View className="flex-row items-center">
                <Text className="text-[13px] font-extrabold text-primary-500 mr-1">−</Text>
                <CoinAmount atomic={price} size={14} textColor="#9E1B32" />
              </View>
            </Row>
            <View className="h-px bg-[#eee2e2]" />
            <Row label={t('market.professions.remaining')} bold>
              <CoinAmount atomic={remaining} size={14} />
            </Row>
          </View>

          <View className="flex-row gap-3 mt-5">
            <TouchableOpacity
              onPress={onClose}
              disabled={buying}
              activeOpacity={0.85}
              className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
              <Text className="text-[14px] font-bold text-[#666]">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={buying}
              activeOpacity={0.9}
              className={`flex-1 rounded-[12px] py-3 items-center ${buying ? 'bg-primary-500/60' : 'bg-primary-500'}`}>
              {buying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-[14px] font-bold text-white">
                  {t('market.professions.confirm')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, bold, children }: { label: string; bold?: boolean; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text
        className={`text-[13px] ${bold ? 'font-extrabold text-charcoal' : 'text-[#777]'}`}
        style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>{children}</View>
    </View>
  );
}
