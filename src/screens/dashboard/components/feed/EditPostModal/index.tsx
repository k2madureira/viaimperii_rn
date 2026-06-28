import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { ImageIcon } from '../../../../../components/icons';
import { FeedItem, uploadFeedImage } from '../../../../../api/feed/feedApi';
import { useUpdatePost } from '../../../model/mutations/useUpdatePost';

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
  item: FeedItem | null;
  onClose: () => void;
}

export default function EditPostModal({ item, onClose }: Props) {
  const { t } = useTranslation();
  const updateM = useUpdatePost();

  const [body, setBody] = useState('');
  const [keptImageUrl, setKeptImageUrl] = useState<string | null>(null); // imagem atual mantida
  const [newImageUri, setNewImageUri] = useState<string | null>(null); // nova imagem local
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setBody(item?.body ?? '');
    setKeptImageUrl(item?.image_url ?? null);
    setNewImageUri(null);
    setUploading(false);
  }, [item?.id]);

  const previewUri = newImageUri ?? keptImageUrl;
  const hasImage = previewUri != null;
  const canSave =
    (body.trim().length > 0 || hasImage) && !uploading && !updateM.isPending;

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
      setNewImageUri(compressed);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: t('evidenceModal.toastImageError'), text2: e?.message });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setNewImageUri(null);
    setKeptImageUrl(null);
  };

  const handleSave = async () => {
    if (!item || !canSave) return;
    try {
      const input: { body?: string | null; image_key?: string | null } = {
        body: body.trim() || null,
      };
      if (newImageUri) {
        // nova imagem escolhida → sobe e troca
        setUploading(true);
        input.image_key = await uploadFeedImage(newImageUri, 'image/jpeg');
        setUploading(false);
      } else if (keptImageUrl == null && item.image_url != null) {
        // imagem existente foi removida
        input.image_key = '';
      }
      // imagem inalterada → não envia image_key (mantém a atual)
      updateM.mutate({ eventId: item.id, input }, { onSuccess: onClose });
    } catch (e: any) {
      setUploading(false);
      Toast.show({ type: 'error', text1: t('toasts.feedPostUpdateError'), text2: e?.message });
    }
  };

  const busy = uploading || updateM.isPending;

  return (
    <Modal transparent visible={item != null} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full bg-white rounded-[20px] p-5">
            <Text className="text-[16px] font-extrabold text-charcoal mb-3">{t('feed.editTitle')}</Text>

            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder={t('feed.composerPlaceholder')}
              placeholderTextColor="#aaa"
              multiline
              maxLength={2000}
              className="text-[14px] text-charcoal min-h-[80px] bg-[#f7f4f4] rounded-[12px] px-3 py-2.5"
              style={{ textAlignVertical: 'top' }}
            />

            {hasImage ? (
              <View className="rounded-[12px] overflow-hidden border border-[#e0e0e0] mt-3">
                <Image source={{ uri: previewUri! }} style={{ width: '100%', height: 170 }} resizeMode="cover" />
                <TouchableOpacity
                  onPress={removeImage}
                  className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1">
                  <Text className="text-[11px] font-bold text-white">{t('evidenceModal.remove')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                disabled={busy}
                activeOpacity={0.8}
                className="flex-row items-center gap-2 mt-3 px-1 py-2">
                <ImageIcon size={20} color="#9E1B32" />
                <Text className="text-[13px] font-bold text-primary-500">{t('feed.addImage')}</Text>
              </TouchableOpacity>
            )}

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={onClose}
                disabled={busy}
                activeOpacity={0.85}
                className="flex-1 rounded-[12px] py-3 items-center border border-[#e0e0e0]">
                <Text className="text-[14px] font-bold text-[#666]">{t('evidenceModal.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={!canSave}
                activeOpacity={0.85}
                className={`flex-1 rounded-[12px] py-3 items-center ${canSave ? 'bg-primary-500' : 'bg-primary-500/40'}`}>
                {busy ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-[14px] font-bold text-white">{t('feed.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
