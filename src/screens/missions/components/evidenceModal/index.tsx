import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { ImageIcon } from '../../../../components/icons';
import {
  Mission,
  MissionEvidence,
  uploadEvidenceImage,
} from '../../../../api/missions/missionsApi';
import { EVIDENCE_COMPRESS, MAX_EVIDENCE_WIDTH } from '../../../../constants/evidence';

/**
 * Redimensiona (sem upscale) e comprime a imagem para JPEG antes do upload,
 * evitando enviar fotos de celular de vários MB ao presigned URL.
 */
async function compressEvidence(uri: string, originalWidth?: number): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  if (originalWidth && originalWidth > MAX_EVIDENCE_WIDTH) {
    ctx.resize({ width: MAX_EVIDENCE_WIDTH });
  }
  const rendered = await ctx.renderAsync();
  const out = await rendered.saveAsync({ compress: EVIDENCE_COMPRESS, format: SaveFormat.JPEG });
  return out.uri;
}

interface Props {
  mission: Mission | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (evidence: MissionEvidence) => void;
}

// Modal de evidência para concluir missões com proof_type != none.
export default function EvidenceModal({ mission, submitting, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const proof = mission?.proof_type ?? 'none';
  const wantsLink = proof === 'link' || proof === 'any';
  const wantsText = proof === 'text' || proof === 'any';
  const wantsImage = proof === 'image' || proof === 'any';

  const [link, setLink] = useState('');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Limpa o formulário a cada nova missão.
  useEffect(() => {
    setLink('');
    setText('');
    setImageUri(null);
    setUploading(false);
  }, [mission?.slug]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: 'error', text1: t('evidenceModal.toastGalleryDenied') });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1, // a compressão real é feita no compressEvidence (resize + JPEG)
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      setUploading(true); // reaproveita o estado de "ocupado" enquanto comprime
      const compressed = await compressEvidence(asset.uri, asset.width);
      setImageUri(compressed);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: t('evidenceModal.toastImageError'), text2: e?.message });
    } finally {
      setUploading(false);
    }
  };

  // any → basta uma evidência; tipos específicos → aquela evidência é obrigatória.
  const hasLink = link.trim().length > 0;
  const hasText = text.trim().length > 0;
  const hasImage = imageUri != null;
  const canSubmit =
    proof === 'any'
      ? hasLink || hasText || hasImage
      : (!wantsLink || hasLink) && (!wantsText || hasText) && (!wantsImage || hasImage);

  const handleSubmit = async () => {
    if (!mission || !canSubmit || submitting || uploading) return;
    try {
      const evidence: MissionEvidence = {};
      if (hasLink) evidence.link = link.trim();
      if (hasText) evidence.text = text.trim();
      if (hasImage && imageUri) {
        setUploading(true);
        // compressEvidence sempre gera JPEG, então o content-type é fixo.
        evidence.image_key = await uploadEvidenceImage(imageUri, 'image/jpeg');
        setUploading(false);
      }
      onSubmit(evidence);
    } catch (e: any) {
      setUploading(false);
      Toast.show({ type: 'error', text1: t('evidenceModal.toastEvidenceError'), text2: e?.message });
    }
  };

  const busy = submitting || uploading;

  return (
    <Modal transparent visible={mission != null} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full bg-white rounded-[20px] p-5" style={{ maxHeight: '85%' }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 12 }}>
              <Text className="text-[16px] font-extrabold text-charcoal">{t('evidenceModal.title')}</Text>
              <Text className="text-[13px] text-[#555]">{mission?.name}</Text>

              {mission?.acceptance_criteria ? (
            <View className="bg-accent-500/10 border border-accent-500/30 rounded-[12px] px-3 py-2.5">
              <Text className="text-[11px] font-bold text-[#9a7b1f] uppercase tracking-[1px] mb-1">
                {t('evidenceModal.acceptanceCriterion')}
              </Text>
              <Text className="text-[12px] text-[#7a5b00] leading-[17px]">
                {mission.acceptance_criteria}
              </Text>
            </View>
          ) : null}

          {proof === 'any' && (
            <Text className="text-[11px] text-[#888]">{t('evidenceModal.atLeastOne')}</Text>
          )}

          {wantsLink && (
            <View className="gap-1">
              <Text className="text-[12px] font-semibold text-charcoal">{t('evidenceModal.link')}</Text>
              <TextInput
                value={link}
                onChangeText={setLink}
                placeholder="https://..."
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                keyboardType="url"
                className="border border-[#e0e0e0] rounded-[10px] px-3 py-2.5 text-[14px] text-charcoal"
              />
            </View>
          )}

          {wantsText && (
            <View className="gap-1">
              <Text className="text-[12px] font-semibold text-charcoal">{t('evidenceModal.description')}</Text>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t('evidenceModal.descriptionPlaceholder')}
                placeholderTextColor="#aaa"
                multiline
                className="border border-[#e0e0e0] rounded-[10px] px-3 py-2.5 text-[14px] text-charcoal min-h-[80px]"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
          )}

          {wantsImage && (
            <View className="gap-1.5">
              <Text className="text-[12px] font-semibold text-charcoal">{t('evidenceModal.image')}</Text>
              {imageUri ? (
                <View className="rounded-[12px] overflow-hidden border border-[#e0e0e0]">
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => setImageUri(null)}
                    className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1">
                    <Text className="text-[11px] font-bold text-white">{t('evidenceModal.remove')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.85}
                  className="border border-dashed border-[#cbbcbc] rounded-[12px] py-6 items-center flex-row justify-center gap-2">
                  <ImageIcon size={18} color="#9E1B32" />
                  <Text className="text-[13px] font-bold text-primary-500">{t('evidenceModal.chooseImage')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View className="flex-row gap-3 mt-1">
            <TouchableOpacity
              onPress={onClose}
              disabled={busy}
              activeOpacity={0.85}
              className="flex-1 rounded-[12px] py-3 items-center border border-[#e0e0e0]">
              <Text className="text-[14px] font-bold text-[#666]">{t('evidenceModal.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit || busy}
              activeOpacity={0.85}
              className={`flex-1 rounded-[12px] py-3 items-center ${
                !canSubmit || busy ? 'bg-primary-500/40' : 'bg-primary-500'
              }`}>
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-[14px] font-bold text-white">{t('evidenceModal.send')}</Text>
              )}
            </TouchableOpacity>
          </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
