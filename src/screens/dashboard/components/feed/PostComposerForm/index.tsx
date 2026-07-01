import React, { useState } from 'react';
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { ImageIcon } from '../../../../../components/icons';
import { FeedScope, uploadFeedImage } from '../../../../../api/feed/feedApi';
import { useCreatePost } from '../../../model/mutations/useCreatePost';

// Imagem de feed é pública e exibida maior que a evidência — qualidade/resolução
// um pouco mais altas, ainda comprimida para não enviar fotos de vários MB.
const FEED_IMAGE_MAX_WIDTH = 1280;
const FEED_IMAGE_COMPRESS = 0.7;

async function compressFeedImage(uri: string, originalWidth?: number): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  if (originalWidth && originalWidth > FEED_IMAGE_MAX_WIDTH) {
    ctx.resize({ width: FEED_IMAGE_MAX_WIDTH });
  }
  const rendered = await ctx.renderAsync();
  const out = await rendered.saveAsync({ compress: FEED_IMAGE_COMPRESS, format: SaveFormat.JPEG });
  return out.uri;
}

const SCOPES: FeedScope[] = ['global', 'legion', 'province'];

interface Props {
  canLegion?: boolean;
  canProvince?: boolean;
  autoFocus?: boolean;
  // Quando true, o campo de texto cresce para preencher o espaço vertical
  // disponível — usado no modal (altura fixa) para não sobrar espaço vazio
  // embaixo. No composer inline (altura livre) fica desligado.
  fillHeight?: boolean;
  // Chamado após publicar com sucesso / ao cancelar — cada host decide o que
  // fazer (recolher inline, fechar modal, etc.).
  onPosted?: () => void;
  onCancel?: () => void;
}

// Formulário de criação de post (texto + imagem + escopo) — usado tanto no
// composer inline do feed quanto no modal de criação acessível pelo FAB.
export default function PostComposerForm({
  canLegion,
  canProvince,
  autoFocus = true,
  fillHeight = false,
  onPosted,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const createM = useCreatePost();

  const [body, setBody] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scope, setScope] = useState<FeedScope>('global');
  const [uploading, setUploading] = useState(false);

  const scopeAllowed = (s: FeedScope) =>
    s === 'global' || (s === 'legion' && canLegion) || (s === 'province' && canProvince);

  const reset = () => {
    setBody('');
    setImageUri(null);
    setScope('global');
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: 'error', text1: t('evidenceModal.toastGalleryDenied') });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      setUploading(true);
      const compressed = await compressFeedImage(asset.uri, asset.width);
      setImageUri(compressed);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: t('evidenceModal.toastImageError'), text2: e?.message });
    } finally {
      setUploading(false);
    }
  };

  const canPost = (body.trim().length > 0 || imageUri != null) && !uploading && !createM.isPending;

  const handlePost = async () => {
    if (!canPost) return;
    try {
      let image_key: string | undefined;
      if (imageUri) {
        setUploading(true);
        image_key = await uploadFeedImage(imageUri, 'image/jpeg');
        setUploading(false);
      }
      createM.mutate(
        { body: body.trim() || undefined, image_key, scope },
        {
          onSuccess: () => {
            reset();
            onPosted?.();
          },
        },
      );
    } catch (e: any) {
      setUploading(false);
      Toast.show({ type: 'error', text1: t('toasts.feedPostError'), text2: e?.message });
    }
  };

  const busy = uploading || createM.isPending;

  return (
    <View style={fillHeight ? { flex: 1 } : undefined}>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={t('feed.composerPlaceholder')}
        placeholderTextColor="#aaa"
        multiline
        autoFocus={autoFocus}
        maxLength={2000}
        className={`text-[14px] text-charcoal border border-[#e5e5e5] rounded-[12px] p-4 ${fillHeight ? '' : 'min-h-[54px]'}`}
        style={fillHeight ? { textAlignVertical: 'top', flex: 1 } : { textAlignVertical: 'top' }}
      />

      {imageUri && (
        <View className="rounded-[12px] overflow-hidden border border-[#e0e0e0] mt-2">
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
          <TouchableOpacity
            onPress={() => setImageUri(null)}
            className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1">
            <Text className="text-[11px] font-bold text-white">{t('evidenceModal.remove')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Escopo da publicação — deixa claro que a escolha define quem vê o post */}
      <Text className="text-[11px] font-semibold text-[#999] mt-3 mb-1.5">
        {t('feed.scopeLabel')}
      </Text>
      <View className="flex-row gap-2">
        {SCOPES.filter(scopeAllowed).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setScope(s)}
            activeOpacity={0.8}
            className={`rounded-full px-3 py-1.5 border ${
              scope === s ? 'bg-primary-500/10 border-primary-500/40' : 'bg-[#faf7f7] border-[#f0eded]'
            }`}>
            <Text className={`text-[12px] font-bold ${scope === s ? 'text-primary-500' : 'text-[#888]'}`}>
              {t(`feed.scope.${s}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ações */}
      <View className="flex-row items-center justify-between mt-5">
        <TouchableOpacity
          onPress={pickImage}
          disabled={busy}
          activeOpacity={0.7}
          className="flex-row items-center gap-2 px-2 py-1.5">
          <ImageIcon size={20} color="#9E1B32" />
          <Text className="text-[13px] font-bold text-primary-500">{t('feed.addImage')}</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => {
              reset();
              onCancel?.();
            }}
            disabled={busy}
            activeOpacity={0.8}
            className="rounded-[12px] px-4 py-2.5 border border-[#e0e0e0]">
            <Text className="text-[13px] font-bold text-[#666]">{t('evidenceModal.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.85}
            className={`rounded-[12px] px-5 py-2.5 items-center ${canPost ? 'bg-primary-500' : 'bg-primary-500/40'}`}>
            {busy ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-[13px] font-bold text-white">{t('feed.post')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
