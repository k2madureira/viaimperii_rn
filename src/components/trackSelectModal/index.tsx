import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Track } from '../../api/ranks/ranksApi';

const TRACK_FLAVOR_SLUGS = ['legionarios', 'patricios'];

interface Props {
  visible: boolean;
  tracks: Track[];
  currentTrackSlug?: string | null;
  isLoading?: boolean;
  onChoose: (trackSlug: string) => void;
  onClose?: () => void;
}

export default function TrackSelectModal({
  visible,
  tracks,
  currentTrackSlug,
  isLoading,
  onChoose,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const track = tracks[selectedIdx] ?? null;
  const isChange = !!currentTrackSlug && currentTrackSlug !== track?.slug;
  const hasFlavor = !!track && TRACK_FLAVOR_SLUGS.includes(track.slug);

  const handleChoose = () => setConfirming(true);

  const handleConfirm = () => {
    if (!track) return;
    setConfirming(false);
    onChoose(track.slug);
  };

  const canClose = !!onClose;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={canClose ? onClose : undefined}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-[24px] overflow-hidden" style={{ maxHeight: '90%' }}>
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-[#e0e0e0]" />
          </View>

          {/* Título */}
          <View className="px-6 pt-3 pb-2">
            <Text
              className="text-[20px] font-extrabold text-[#111] text-center"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {t('trackSelect.title')}
            </Text>
            <Text className="text-[13px] text-[#888] text-center mt-1">
              {currentTrackSlug
                ? t('trackSelect.changeCost')
                : t('trackSelect.firstChoice')}
            </Text>
          </View>

          {/* Seletor de trilha */}
          {tracks.length > 1 && (
            <View className="flex-row mx-6 mt-2 bg-[#f0eded] rounded-[12px] p-1">
              {tracks.map((t, i) => {
                const active = i === selectedIdx;
                return (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.85}
                    onPress={() => { setSelectedIdx(i); setConfirming(false); }}
                    className={`flex-1 py-2.5 rounded-[9px] items-center ${active ? 'bg-white' : ''}`}>
                    <Text className={`text-[13px] font-bold ${active ? 'text-primary' : 'text-[#888]'}`}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, gap: 16 }}>
            {track && (
              <>
                {/* Imagem da patente máxima da trilha */}
                {track.max_rank_image_url && (
                  <View className="items-center">
                    <Image
                      source={{ uri: track.max_rank_image_url }}
                      style={{ width: 90, height: 90 }}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {/* Tagline + foco + tipo de missão */}
                {hasFlavor && (
                  <View className="items-center gap-1">
                    <Text
                      className="text-[13px] font-bold text-primary tracking-[1px] uppercase"
                      style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                      {t(`trackSelect.flavor.${track.slug}.tagline`)}
                    </Text>
                    <Text className="text-[14px] text-[#333] text-center leading-[20px]">
                      {t(`trackSelect.flavor.${track.slug}.focus`)}
                    </Text>
                  </View>
                )}

                {/* Tipo de missão */}
                {hasFlavor && (
                  <View className="bg-[#f4eaea] border border-primary/15 rounded-[12px] px-4 py-3 flex-row items-start gap-2">
                    <Text className="text-[16px]">⚔️</Text>
                    <Text className="flex-1 text-[13px] text-[#5a1a26] leading-[19px]">
                      {t(`trackSelect.flavor.${track.slug}.missionType`)}
                    </Text>
                  </View>
                )}

                {/* Atributos */}
                {track.attributes?.length > 0 && (
                  <View className="bg-[#fafafa] border border-[#f0eded] rounded-[14px] p-4 gap-2">
                    {track.attributes.map((attr, i) => (
                      <View key={i} className="flex-row items-start gap-2">
                        <Text className="text-primary text-[14px] leading-[20px]">·</Text>
                        <Text className="flex-1 text-[13px] text-[#444] leading-[20px]">{attr}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Aviso de penalidade (troca) */}
                {isChange && (
                  <View className="bg-gold/15 border border-gold/40 rounded-[12px] px-4 py-3 flex-row items-start gap-2">
                    <Text className="text-[16px]">⚠️</Text>
                    <Text className="flex-1 text-[12px] text-[#7a5b00] leading-[18px]">
                      {t('trackSelect.changeWarning', { name: track.name })}
                    </Text>
                  </View>
                )}

                {/* Overlay de confirmação */}
                {confirming ? (
                  <View className="bg-[#fdf7f8] border border-primary/20 rounded-[14px] p-4 gap-3">
                    <Text className="text-[15px] font-extrabold text-[#111] text-center">
                      {t('trackSelect.confirmChoiceTitle')}
                    </Text>
                    <Text className="text-[13px] text-[#666] text-center leading-[18px]">
                      {t('trackSelect.confirmChoiceIntro', { name: track.name })}
                      {isChange
                        ? t('trackSelect.confirmChange')
                        : t('trackSelect.confirmFirst')}
                    </Text>
                    <View className="flex-row gap-3 mt-1">
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setConfirming(false)}
                        className="flex-1 border border-[#ddd] rounded-[10px] py-3 items-center">
                        <Text className="text-[14px] font-bold text-[#555]">{t('common.cancel')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleConfirm}
                        className="flex-1 bg-primary rounded-[10px] py-3 items-center">
                        {isLoading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text className="text-[14px] font-bold text-white">{t('common.confirm')}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleChoose}
                    className="bg-primary rounded-[12px] py-3.5 items-center">
                    <Text className="text-[15px] font-bold text-white">
                      {t('trackSelect.chooseTrack', { name: track.name })}
                    </Text>
                  </TouchableOpacity>
                )}

                {canClose && !confirming && (
                  <TouchableOpacity activeOpacity={0.7} onPress={onClose} className="items-center py-1">
                    <Text className="text-[13px] text-[#aaa]">{t('trackSelect.decideLater')}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
