import React from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ClanDetail } from '../../../../../api/clan';
import { StandardIcon } from '../../../../../components/icons';
import { clanDivisionSlug } from '../../../../../constants/clans';

interface Props {
  clan: ClanDetail | null;
  loading?: boolean;
  // Só o dono do perfil pode buscar/entrar em clã (ações do próprio usuário).
  isOwnProfile?: boolean;
  onOpen?: () => void; // tem clã → abre a tela do clã
  onSearch?: () => void; // sem clã → abre o diretório de clãs
}

// Card do clã no Perfil (abaixo do card de Legião). Com clã → card ativo clicável.
// Sem clã → card DESABILITADO + botão "Buscar clãs" (envio de solicitação/convite).
export default function ClanCard({ clan, loading, isOwnProfile, onOpen, onSearch }: Props) {
  const { t } = useTranslation();

  // Sem clã: card desabilitado (visual apagado) + CTA de busca (só no próprio perfil).
  if (!clan) {
    return (
      <View className="bg-[#ececec] rounded-[16px] p-5 min-h-[120px] justify-center">
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-black/5 items-center justify-center mr-4">
            <StandardIcon size={26} color="#b9b9b9" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] font-semibold text-[#9a9a9a] tracking-[3px] uppercase">
              {t('clanCard.yourClan')}
            </Text>
            <View className="h-1" />
            <Text
              className="text-[18px] font-extrabold text-[#8a8a8a]"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {t('clanCard.noClan')}
            </Text>
            <Text className="text-[12px] text-[#9a9a9a] mt-1">{t('clanCard.noClanHint')}</Text>
          </View>
        </View>

        {isOwnProfile ? (
          <TouchableOpacity
            className="bg-primary-700 rounded-[12px] py-3 items-center mt-4"
            activeOpacity={0.85}
            disabled={loading}
            onPress={onSearch}>
            <Text className="text-[14px] font-bold text-white">{t('clanCard.searchClans')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  const division = clan.my_rank_level
    ? t(`clan.divisions.${clanDivisionSlug(clan.my_rank_level)}`)
    : null;

  return (
    <TouchableOpacity
      className="bg-laurel rounded-[16px] p-5 min-h-[120px]"
      activeOpacity={0.9}
      onPress={onOpen}>
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-full bg-white/15 items-center justify-center mr-4 overflow-hidden">
          {clan.emblem_url ? (
            <Image
              source={{ uri: clan.emblem_url }}
              style={{ width: 52, height: 52 }}
              resizeMode="contain"
            />
          ) : (
            <StandardIcon size={30} color="#fff" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-[11px] font-semibold text-white/70 tracking-[3px] uppercase">
            {t('clanCard.yourClan')}
          </Text>
          <View className="h-1" />
          <Text
            className="text-[20px] font-extrabold text-white"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            numberOfLines={1}>
            {clan.name}
          </Text>
          {division ? (
            <Text className="text-[12px] text-white/80 mt-1">{division}</Text>
          ) : null}
        </View>

        <Text className="text-white/60 text-[22px] ml-2">›</Text>
      </View>
    </TouchableOpacity>
  );
}
