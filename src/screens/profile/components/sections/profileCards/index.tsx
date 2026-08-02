import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GetUserResponse } from '../../../../../api/users';
import { legionColorById } from '../../../../../utils/legionColors';
import { ClanCard, LegionCard, RankCard } from '../../../../dashboard/components';
import { useLegions } from '../../../../missions/model/queries/useLegions';
import { useUserClan } from '../../../../clan/model/queries/useUserClan';
import LocalCard from '../../cards/localCard';

interface Props {
  data: GetUserResponse | undefined;
  rankName: string;
  totalXp: number;
  userId: string | undefined;
  isOwnProfile: boolean;
}

// Cards: patente (componente da home) · legião (brasão) · clã (guilda) · origem.
export default function ProfileCards({ data, rankName, totalXp, userId, isOwnProfile }: Props) {
  const navigation = useNavigation<any>();
  // Legiões — usadas só para derivar a cor canônica da legião (igual à home).
  const legionsQuery = useLegions();
  // Clã do usuário do perfil — card abaixo do de legião (entrada para a tela do clã).
  const clanQuery = useUserClan(userId);
  const cr = data?.current_rank;

  return (
    <View className="gap-3">
      <RankCard
        rank={rankName}
        totalXp={totalXp}
        xpToNextRank={cr?.xp_to_next_rank ?? 0}
        progressPct={cr?.progress_pct}
        imageUrl={cr?.image_url}
        trackName={data?.track?.name}
        onPress={() => navigation.navigate('Home', { screen: 'Ranks' })}
      />
      <LegionCard
        legion={data?.legion ?? null}
        color={legionColorById(legionsQuery.data, data?.legion?.id)}
        onPress={() => navigation.navigate('Home', { screen: 'LegionHQ' })}
      />
      <ClanCard
        clan={clanQuery.data?.clan ?? null}
        loading={clanQuery.isLoading}
        isOwnProfile={isOwnProfile}
        onOpen={() => navigation.navigate('Home', { screen: 'Clan', params: {} })}
        onSearch={() => navigation.navigate('Home', { screen: 'ClanDirectory' })}
      />
      <LocalCard
        country={data?.province?.country ?? null}
        province={data?.province?.name ?? null}
        track={data?.track?.name ?? null}
      />
    </View>
  );
}
