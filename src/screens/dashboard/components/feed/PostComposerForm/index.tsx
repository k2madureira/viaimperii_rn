import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { ImageIcon } from '../../../../../components/icons';
import {
  FeedAuthor,
  FeedScope,
  FeedMediaContentType,
  MediaType,
  PostMediaInput,
  uploadFeedMedia,
} from '../../../../../api/feed/feedApi';
import { useCreatePost } from '../../../model/mutations/useCreatePost';
import MarkdownEditor, { Selection } from '../MarkdownEditor';
import MentionSuggestions from '../MentionSuggestions';
import AnchoredPopover, { Anchor } from '../AnchoredPopover';
import { markdownToHtml } from '../markdown';
import { activeToken, replaceRange } from '../tokenUtils';

// Imagem de feed é pública e exibida maior que a evidência — qualidade/resolução
// um pouco mais altas, ainda comprimida para não enviar fotos de vários MB.
const FEED_IMAGE_MAX_WIDTH = 1280;
const FEED_IMAGE_COMPRESS = 0.7;
const MAX_MEDIA = 10; // espelha MAX_MEDIA_PER_POST do backend

// Mídia escolhida ainda não enviada — `uri` local + tipo/contentType p/ upload.
interface PickedMedia {
  uri: string;
  type: MediaType;
  contentType: FeedMediaContentType;
}

async function compressFeedImage(uri: string, originalWidth?: number): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  if (originalWidth && originalWidth > FEED_IMAGE_MAX_WIDTH) {
    ctx.resize({ width: FEED_IMAGE_MAX_WIDTH });
  }
  const rendered = await ctx.renderAsync();
  const out = await rendered.saveAsync({ compress: FEED_IMAGE_COMPRESS, format: SaveFormat.JPEG });
  return out.uri;
}

function videoContentType(asset: ImagePicker.ImagePickerAsset): FeedMediaContentType {
  const mime = asset.mimeType ?? '';
  if (mime.includes('quicktime') || asset.uri.toLowerCase().endsWith('.mov')) return 'video/quicktime';
  return 'video/mp4';
}

const SCOPES: FeedScope[] = ['global', 'legion', 'province'];

interface Props {
  canLegion?: boolean;
  canProvince?: boolean;
  autoFocus?: boolean;
  // Quando true, dá uma área de edição inicial maior (modal de criação, com mais
  // espaço). No composer inline fica desligado (editor mais compacto).
  large?: boolean;
  // Avatar do autor exibido no cabeçalho, ao lado do seletor de audiência.
  authorAvatarUrl?: string | null;
  // Texto inicial (ex.: compartilhar uma missão concluída) — editável antes de publicar.
  initialText?: string;
  // Chamado após publicar com sucesso / ao cancelar — cada host decide o que
  // fazer (recolher inline, fechar modal, etc.).
  onPosted?: () => void;
  onCancel?: () => void;
}

// Formulário de criação de post (texto + mídia + escopo) — usado tanto no composer
// inline do feed quanto no modal de criação (FAB). O texto é um TextInput nativo
// com markdown leve (ver MarkdownEditor); o envio converte markdown → HTML.
export default function PostComposerForm({
  canLegion,
  canProvince,
  autoFocus = true,
  large = false,
  authorAvatarUrl,
  initialText,
  onPosted,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const createM = useCreatePost();

  const [text, setText] = useState(initialText ?? '');
  const [selection, setSelection] = useState<Selection>({
    start: (initialText ?? '').length,
    end: (initialText ?? '').length,
  });
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const [scope, setScope] = useState<FeedScope>('global');
  const [uploading, setUploading] = useState(false);
  // Usuários mencionados já escolhidos (uuid + nome) — filtra no envio quem ainda
  // está presente no texto final.
  const [pickedMentions, setPickedMentions] = useState<{ id: string; name: string }[]>([]);

  // Token @/# no cursor → dirige a lista de sugestões de menção.
  const token = useMemo(() => activeToken(text, selection.start), [text, selection.start]);
  const mentionQuery = token?.type === '@' ? token.query : null;

  // Dropdown de audiência ("publicar para") ancorado ao pill do cabeçalho.
  const pillRef = useRef<any>(null);
  const [scopeAnchor, setScopeAnchor] = useState<Anchor | null>(null);
  const openScopeMenu = () =>
    pillRef.current?.measureInWindow?.((x: number, y: number, width: number, height: number) =>
      setScopeAnchor({ x, y, width, height }),
    );

  const scopeAllowed = (s: FeedScope) =>
    s === 'global' || (s === 'legion' && canLegion) || (s === 'province' && canProvince);

  // Ao escolher um usuário: troca o "@parcial" pelo "@Nome " no texto e guarda o
  // uuid para enviar em `mentions`.
  const selectMention = (user: FeedAuthor) => {
    if (!token || token.type !== '@') return;
    const insert = `@${user.name} `;
    setText(replaceRange(text, token.start, token.end, insert));
    const caret = token.start + insert.length;
    setSelection({ start: caret, end: caret });
    setPickedMentions((prev) =>
      prev.some((p) => p.id === user.id) ? prev : [...prev, { id: user.id, name: user.name }],
    );
  };

  const reset = () => {
    setText('');
    setSelection({ start: 0, end: 0 });
    setMedia([]);
    setScope('global');
    setPickedMentions([]);
  };

  const removeMedia = (uri: string) => setMedia((prev) => prev.filter((m) => m.uri !== uri));

  const pickMedia = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: 'error', text1: t('evidenceModal.toastGalleryDenied') });
      return;
    }
    const remaining = MAX_MEDIA - media.length;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // imagens e vídeos
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 1,
    });
    if (result.canceled) return;
    try {
      setUploading(true);
      const picked: PickedMedia[] = [];
      for (const asset of result.assets) {
        if (asset.type === 'video') {
          // Vídeo sobe como está (sem transcodificar no client).
          picked.push({ uri: asset.uri, type: 'video', contentType: videoContentType(asset) });
        } else {
          const compressed = await compressFeedImage(asset.uri, asset.width);
          picked.push({ uri: compressed, type: 'image', contentType: 'image/jpeg' });
        }
      }
      setMedia((prev) => [...prev, ...picked].slice(0, MAX_MEDIA));
    } catch (e: any) {
      Toast.show({ type: 'error', text1: t('evidenceModal.toastImageError'), text2: e?.message });
    } finally {
      setUploading(false);
    }
  };

  const hasText = text.trim().length > 0;
  const canPost = (hasText || media.length > 0) && !uploading && !createM.isPending;

  const handlePost = async () => {
    if (!canPost) return;
    try {
      let mediaInput: PostMediaInput[] | undefined;
      if (media.length > 0) {
        setUploading(true);
        mediaInput = [];
        for (const m of media) {
          const key = await uploadFeedMedia(m.uri, m.contentType);
          mediaInput.push({ key, type: m.type });
        }
        setUploading(false);
      }
      // markdown → HTML (backend sanitiza contra o allowlist). Vazio → sem texto.
      const bodyHtml = hasText ? markdownToHtml(text.trim()) : undefined;
      // Só envia menções cujo @nome ainda está presente no texto final.
      const mentions = pickedMentions.filter((p) => text.includes(`@${p.name}`)).map((p) => p.id);
      createM.mutate(
        {
          body: bodyHtml,
          media: mediaInput,
          mentions: mentions.length ? [...new Set(mentions)] : undefined,
          scope,
        },
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
    <View>
      {/* Cabeçalho: ícone do usuário (esquerda) + audiência ao lado, com espaçamento */}
      <View className="flex-row items-center mb-3">
        <View className="w-9 h-9 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden">
          {authorAvatarUrl ? (
            <Image source={{ uri: authorAvatarUrl }} style={{ width: 36, height: 36 }} resizeMode="cover" />
          ) : (
            <Text className="text-[15px]">🛡️</Text>
          )}
        </View>

        <TouchableOpacity
          ref={pillRef}
          onPress={openScopeMenu}
          activeOpacity={0.8}
          className="flex-row items-center gap-1.5 rounded-full border border-[#eadfdf] bg-[#faf7f7] px-3 py-1.5 ml-3">
          <Text className="text-[11px] font-semibold text-[#999]">{t('feed.audienceLabel')}</Text>
          <Text className="text-[12px] font-bold text-primary-500">{t(`feed.scope.${scope}`)}</Text>
          <Text className="text-[10px] text-primary-500">▾</Text>
        </TouchableOpacity>
      </View>

      <MarkdownEditor
        value={text}
        onChangeText={setText}
        selection={selection}
        onSelectionChange={setSelection}
        autoFocus={autoFocus}
        minHeight={large ? 200 : 140}
        placeholder={t('feed.composerPlaceholder', { defaultValue: 'Escreva algo…' })}
      />

      {/* Sugestões de @menção — dispara ao digitar "@parcial" */}
      <MentionSuggestions query={mentionQuery} onSelect={selectMention} />

      {media.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-2">
          {media.map((m) => (
            <View
              key={m.uri}
              className="rounded-[12px] overflow-hidden border border-[#e0e0e0]"
              style={{ width: 96, height: 96 }}>
              <Image source={{ uri: m.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              {m.type === 'video' && (
                <View className="absolute inset-0 items-center justify-center">
                  <View className="w-8 h-8 rounded-full bg-black/55 items-center justify-center">
                    <Text className="text-white text-[13px] ml-0.5">▶</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity
                onPress={() => removeMedia(m.uri)}
                className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 items-center justify-center">
                <Text className="text-[12px] font-bold text-white">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Ações */}
      <View className="flex-row items-center justify-between mt-5">
        <TouchableOpacity
          onPress={pickMedia}
          disabled={busy || media.length >= MAX_MEDIA}
          activeOpacity={0.7}
          className="flex-row items-center gap-2 px-2 py-1.5">
          <ImageIcon size={20} color="#9E1B32" />
          <Text className="text-[13px] font-bold text-primary-500">
            {t('feed.addMedia')}
            {media.length > 0 ? ` (${media.length}/${MAX_MEDIA})` : ''}
          </Text>
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

      {/* Menu de audiência ("publicar para") */}
      <AnchoredPopover anchor={scopeAnchor} onClose={() => setScopeAnchor(null)} width={200} align="left">
        {SCOPES.filter(scopeAllowed).map((s, i) => (
          <TouchableOpacity
            key={s}
            onPress={() => {
              setScope(s);
              setScopeAnchor(null);
            }}
            activeOpacity={0.7}
            className={`px-4 py-3 ${i > 0 ? 'border-t border-[#f3eeee]' : ''}`}>
            <Text className={`text-[13px] font-bold ${scope === s ? 'text-primary-500' : 'text-charcoal'}`}>
              {t(`feed.scope.${s}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </AnchoredPopover>
    </View>
  );
}
