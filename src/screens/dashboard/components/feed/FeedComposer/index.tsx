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

interface Props {
  avatarUrl?: string | null;
  canLegion?: boolean;
  canProvince?: boolean;
}

const SCOPES: FeedScope[] = ['global', 'legion', 'province'];

export default function FeedComposer({ avatarUrl, canLegion, canProvince }: Props) {
  const { t } = useTranslation();
  const createM = useCreatePost();

  const [expanded, setExpanded] = useState(false);
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
    setExpanded(false);
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
        { onSuccess: reset },
      );
    } catch (e: any) {
      setUploading(false);
      Toast.show({ type: 'error', text1: t('toasts.feedPostError'), text2: e?.message });
    }
  };

  const busy = uploading || createM.isPending;

  if (!expanded) {
    return (
      <TouchableOpacity
        onPress={() => setExpanded(true)}
        activeOpacity={0.85}
        className="flex-row items-center bg-white border border-[#f0eded] rounded-[16px] px-4 py-3">
        <View className="w-9 h-9 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden mr-3">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 36, height: 36 }} resizeMode="cover" />
          ) : (
            <Text className="text-[14px]">🛡️</Text>
          )}
        </View>
        <Text className="flex-1 text-[14px] text-[#999]">{t('feed.composerPlaceholder')}</Text>
        <ImageIcon size={20} color="#9E1B32" />
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white border border-[#f0eded] rounded-[16px] p-4">
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={t('feed.composerPlaceholder')}
        placeholderTextColor="#aaa"
        multiline
        autoFocus
        maxLength={2000}
        className="text-[14px] text-charcoal min-h-[64px]"
        style={{ textAlignVertical: 'top' }}
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

      {/* Escopo da publicação */}
      <View className="flex-row gap-2 mt-3">
        {SCOPES.filter(scopeAllowed).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setScope(s)}
            activeOpacity={0.8}
            className={`rounded-full px-3 py-1.5 border ${
              scope === s ? 'bg-bg-primary-500/10 border-bg-primary-500/40' : 'bg-[#faf7f7] border-[#f0eded]'
            }`}>
            <Text className={`text-[12px] font-bold ${scope === s ? 'text-bg-primary-500' : 'text-[#888]'}`}>
              {t(`feed.scope.${s}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ações */}
      <View className="flex-row items-center justify-between mt-3">
        <TouchableOpacity
          onPress={pickImage}
          disabled={busy}
          activeOpacity={0.7}
          className="flex-row items-center gap-2 px-2 py-1.5">
          <ImageIcon size={20} color="#9E1B32" />
          <Text className="text-[13px] font-bold text-bg-primary-500">{t('feed.addImage')}</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={reset}
            disabled={busy}
            activeOpacity={0.8}
            className="rounded-[12px] px-4 py-2.5 border border-[#e0e0e0]">
            <Text className="text-[13px] font-bold text-[#666]">{t('evidenceModal.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.85}
            className={`rounded-[12px] px-5 py-2.5 items-center ${canPost ? 'bg-bg-primary-500' : 'bg-bg-primary-500/40'}`}>
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
