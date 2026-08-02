import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../components/text';
import { useTranslation } from 'react-i18next';
import { ClanMemberItem } from '../../../../../api/clan';
import { CLAN_DIVISION_ORDER } from '../../../../../constants/clans';
import { ClanMemberRow } from '../../cards';

interface Props {
  members: ClanMemberItem[];
}

// Lista de membros do clã ordenada por divisão (maior poder primeiro).
export default function ClanMembers({ members }: Props) {
  const { t } = useTranslation();

  const ordered = React.useMemo(() => {
    return [...members].sort((a, b) => {
      if (b.rank_level !== a.rank_level) return b.rank_level - a.rank_level;
      return (a.user.name ?? '').localeCompare(b.user.name ?? '');
    });
  }, [members]);

  // Mantém CLAN_DIVISION_ORDER referenciado (fonte da ordem canônica de divisões).
  void CLAN_DIVISION_ORDER;

  return (
    <View className="bg-white rounded-[20px] p-5">
      <Text className="text-[13px] font-bold text-[#111] tracking-[1px] uppercase mb-1">
        {t('clan.members.title', { count: members.length })}
      </Text>
      <View>
        {ordered.map((m) => (
          <ClanMemberRow key={m.user.id} member={m} />
        ))}
      </View>
    </View>
  );
}
