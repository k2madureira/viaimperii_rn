import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Text from '../../../../../components/text';
import TextInput from '../../../../../components/textInput';
import { useTranslation } from 'react-i18next';
import { AureusCoin, CoinAmount, StandardIcon } from '../../../../../components/icons';
import { viaimperiiApi } from '../../../../../api';
import { pickClanEmblem } from '../../../../../utils/clanEmblem';
import {
  CLAN_FOUNDING_FEE_ATOMIC,
  CLAN_MEMBER_CAP_BY_LEVEL,
  CLAN_MIN_CREATE_LEVEL,
} from '../../../../../constants/clans';
import { useCreateClan } from '../../../model/mutations/useCreateClan';

interface Props {
  visible: boolean;
  onClose: () => void;
  // Nível de patente do usuário logado (RankImage.level). Abaixo de
  // CLAN_MIN_CREATE_LEVEL o modal mostra só os requisitos, sem o formulário.
  rankLevel: number;
  // Recebe o id do clã recém-fundado para navegar ao detalhe.
  onCreated: (clanId: number) => void;
}

const NAME_MAX = 40;
const TAG_MAX = 6;
const DESC_MAX = 240;

// Modal de fundação de clã — segue o padrão de modal do app (overlay escuro +
// card branco central). Campos: nome (obrigatório), tag e descrição (opcionais).
export default function CreateClanModal({ visible, onClose, rankLevel, onCreated }: Props) {
  const { t } = useTranslation();
  const createM = useCreateClan();
  const canCreate = rankLevel >= CLAN_MIN_CREATE_LEVEL;

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [emblemUri, setEmblemUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = createM.isPending || uploading;

  const reset = () => {
    setName('');
    setTag('');
    setDescription('');
    setEmblemUri(null);
    setUploading(false);
    setError(null);
    createM.reset();
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const onPickEmblem = async () => {
    try {
      const uri = await pickClanEmblem();
      if (uri) setEmblemUri(uri);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: e instanceof Error ? e.message : t('clan.toasts.emblemError'),
      });
    }
  };

  const onSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('clan.create.nameRequired'));
      return;
    }
    setError(null);

    // Sobe o emblema (se escolhido) antes de fundar — a fundação recebe a key.
    let emblemKey: string | undefined;
    if (emblemUri) {
      try {
        setUploading(true);
        emblemKey = await viaimperiiApi.upload.media(emblemUri, 'image/webp', 'clan');
      } catch (e) {
        setUploading(false);
        setError(e instanceof Error ? e.message : t('clan.toasts.emblemError'));
        return;
      }
      setUploading(false);
    }

    createM.mutate(
      {
        name: trimmed,
        tag: tag.trim() || undefined,
        description: description.trim() || undefined,
        emblem_key: emblemKey,
      },
      {
        onSuccess: (res) => {
          reset();
          onClose();
          if (res.clan_id) onCreated(res.clan_id);
        },
        onError: (e) => setError(e instanceof Error ? e.message : t('clan.toasts.createError')),
      },
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <Pressable className="absolute inset-0" onPress={close} />
          <View className="w-full bg-white rounded-[20px] p-6" style={{ maxHeight: '88%' }}>
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[18px] font-extrabold text-[#111]">
                {t('clan.create.title')}
              </Text>
              <TouchableOpacity
                onPress={close}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text className="text-[20px] text-[#999] leading-none">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Sem patente suficiente: mostra só os requisitos (nível, custo e
                  capacidade por nível), sem o formulário de fundação. */}
              {!canCreate ? (
                <View>
                  <View className="bg-[#faf3e6] rounded-[12px] px-4 py-3.5 flex-row items-start">
                    <Text className="text-[16px] mr-2">🔒</Text>
                    <Text className="text-[13px] text-[#8a6d1f] leading-[19px] flex-1">
                      {t('clan.create.locked')}
                    </Text>
                  </View>

                  {/* Requisito de patente */}
                  <View className="border border-[#eee] rounded-[14px] px-4 py-3.5 mt-4">
                    <Text className="text-[11px] font-semibold text-[#999] uppercase tracking-[1px]">
                      {t('clan.create.reqRankLabel')}
                    </Text>
                    <Text className="text-[15px] font-bold text-[#111] mt-1">
                      {t('clan.create.reqRankValue')}
                    </Text>
                  </View>

                  {/* Custo de fundação */}
                  <View className="border border-[#eee] rounded-[14px] px-4 py-3.5 mt-3 flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-[11px] font-semibold text-[#999] uppercase tracking-[1px]">
                        {t('clan.create.reqFeeLabel')}
                      </Text>
                      <Text className="text-[12px] text-[#888] mt-1">
                        {t('clan.create.reqFeeHint')}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <AureusCoin size={18} />
                      <CoinAmount atomic={CLAN_FOUNDING_FEE_ATOMIC} size={15} textColor="#111" showSigla />
                    </View>
                  </View>

                  {/* Capacidade por nível do clã */}
                  <View className="border border-[#eee] rounded-[14px] px-4 py-3.5 mt-3">
                    <Text className="text-[11px] font-semibold text-[#999] uppercase tracking-[1px] mb-1">
                      {t('clan.create.reqCapsLabel')}
                    </Text>
                    {CLAN_MEMBER_CAP_BY_LEVEL.map((row) => (
                      <View
                        key={row.level}
                        className="flex-row items-center justify-between py-1.5">
                        <Text className="text-[14px] text-[#333]">
                          {t('clan.header.levelValue', { level: row.level })}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-[14px] font-bold text-[#111] mr-2">
                            {t('clan.create.capMembers', { count: row.cap })}
                          </Text>
                          {row.upgradeFromPrev != null ? (
                            <View className="flex-row items-center">
                              <Text className="text-[11px] text-[#aaa] mr-1">·</Text>
                              <AureusCoin size={13} />
                              <CoinAmount
                                atomic={row.upgradeFromPrev}
                                size={12}
                                textColor="#888"
                                showSigla
                              />
                            </View>
                          ) : (
                            <Text className="text-[11px] text-[#2F7A52] font-semibold">
                              {t('clan.create.capInitial')}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    className="bg-[#f2f2f2] rounded-[14px] py-3.5 items-center mt-5"
                    activeOpacity={0.85}
                    onPress={close}>
                    <Text className="text-[15px] font-bold text-[#555]">
                      {t('common.close')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
              <>
              <Text className="text-[13px] text-[#666] leading-[19px] mb-4">
                {t('clan.create.subtitle')}
              </Text>

              {/* Emblema (opcional) — recorte quadrado + conversão WEBP no picker. */}
              <View className="items-center mb-4">
                <TouchableOpacity
                  className="w-24 h-24"
                  activeOpacity={0.85}
                  disabled={busy}
                  onPress={onPickEmblem}>
                  <View className="w-24 h-24 rounded-full bg-laurel items-center justify-center overflow-hidden">
                    {emblemUri ? (
                      <Image source={{ uri: emblemUri }} style={{ width: 96, height: 96 }} resizeMode="cover" />
                    ) : (
                      <StandardIcon size={40} color="#fff" />
                    )}
                  </View>
                  {/* Badge fora do clip circular, senão seria cortado. */}
                  <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-700 items-center justify-center border-2 border-white">
                    <Text className="text-[13px] text-white leading-none">✎</Text>
                  </View>
                </TouchableOpacity>
                <Text className="text-[12px] text-[#888] mt-2">
                  {emblemUri ? t('clan.emblem.change') : t('clan.emblem.add')}
                </Text>
              </View>

              {/* Nome */}
              <Text className="text-[12px] font-semibold text-[#888] uppercase tracking-[1px] mb-1.5">
                {t('clan.create.nameLabel')}
              </Text>
              <TextInput
                value={name}
                onChangeText={(v) => setName(v.slice(0, NAME_MAX))}
                placeholder={t('clan.create.namePlaceholder')}
                placeholderTextColor="#999"
                className="border border-[#e5e5e5] rounded-[12px] px-4 py-3 text-[15px] text-charcoal"
              />

              {/* Tag */}
              <Text className="text-[12px] font-semibold text-[#888] uppercase tracking-[1px] mb-1.5 mt-4">
                {t('clan.create.tagLabel')}
              </Text>
              <TextInput
                value={tag}
                onChangeText={(v) => setTag(v.slice(0, TAG_MAX).toUpperCase())}
                placeholder={t('clan.create.tagPlaceholder')}
                placeholderTextColor="#999"
                autoCapitalize="characters"
                autoCorrect={false}
                className="border border-[#e5e5e5] rounded-[12px] px-4 py-3 text-[15px] text-charcoal"
              />

              {/* Descrição */}
              <Text className="text-[12px] font-semibold text-[#888] uppercase tracking-[1px] mb-1.5 mt-4">
                {t('clan.create.descLabel')}
              </Text>
              <TextInput
                value={description}
                onChangeText={(v) => setDescription(v.slice(0, DESC_MAX))}
                placeholder={t('clan.create.descPlaceholder')}
                placeholderTextColor="#999"
                multiline
                className="border border-[#e5e5e5] rounded-[12px] px-4 py-3 text-[15px] text-charcoal min-h-[80px]"
                style={{ textAlignVertical: 'top' }}
              />

              {/* Aviso de requisito + taxa */}
              <View className="bg-[#faf3e6] rounded-[12px] px-4 py-3 mt-4">
                <Text className="text-[12px] text-[#8a6d1f] leading-[18px]">
                  {t('clan.create.requirements')}
                </Text>
              </View>

              {error ? (
                <Text className="text-[13px] text-red-500 mt-3">{error}</Text>
              ) : null}

              <TouchableOpacity
                className="bg-primary-700 rounded-[14px] py-3.5 items-center mt-5"
                activeOpacity={0.85}
                disabled={busy || !name.trim()}
                style={{ opacity: busy || !name.trim() ? 0.6 : 1 }}
                onPress={onSubmit}>
                {busy ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-[15px] font-bold text-white">
                    {t('clan.create.submit')}
                  </Text>
                )}
              </TouchableOpacity>
              </>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
