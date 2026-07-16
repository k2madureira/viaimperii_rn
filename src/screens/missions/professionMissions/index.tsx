import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Vibration, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../../components';
import { Mission, MissionDifficulty, MissionEvidence } from '../../../api/missions/missionsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { XP_PER_RANK } from '../../../constants/game';
import { sortByDifficulty } from '../../../constants/missions';
import { professionTheme } from '../../../utils/color';
import { buildAutoCompletionText } from '../../../utils/missionEvidence';
import { MissionsStackParamList } from '../../../navigation/MissionsStack';
import { useUserProfile } from '../../dashboard/model/queries/useUserProfile';
import { useWallet } from '../../dashboard/model/queries/useWallet';
import WalletButton from '../../dashboard/components/walletButton';
import { useTracks } from '../../ranks/model/queries/useTracks';
import { useUserProfessions } from '../../market/model/queries/useProfessions';
import { MissionItem } from '../components';
import {
  ProfessionCarousel,
  ProfessionInfoCard,
  ProfessionMissionsBox,
  ProfessionModals,
  ProfessionTopBar,
  ProfessionTypeSelector,
} from './components/sections';
import { useAbandonMission, useCompleteMission, useStartMission } from '../model/mutations/useMissionMutations';
import { useAvailableMissions } from '../model/queries/useAvailableMissions';
import { useMissions } from '../model/queries/useMissions';

type Tab = 'available' | 'inprogress';

// Tela dedicada às missões de UMA profissão adquirida. Toda a cromática (cabeçalho,
// seletor de tipo, abas e botões) segue a cor principal da profissão (harmonia via
// tints da mesma cor). Acessada apenas a partir da tela de Missões.
export default function ProfessionMissionsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<MissionsStackParamList, 'ProfessionMissions'>>();
  const initialProfession = route.params?.profession ?? null;
  const { user } = useAuth();

  // Profissões ativas do usuário — alimentam o carrossel de troca de profissão.
  const userProfessionsQuery = useUserProfessions(user?.user_id, !!user);
  const activeProfessions = (userProfessionsQuery.data ?? [])
    .filter((up) => up.is_active)
    .map((up) => up.profession);

  // Profissão selecionada (seleção inicial vem da rota; senão a 1ª ativa).
  const [selectedId, setSelectedId] = useState<number | null>(initialProfession?.id ?? null);
  const profession =
    activeProfessions.find((p) => p.id === selectedId) ?? initialProfession ?? activeProfessions[0] ?? null;
  const professionId = profession?.id ?? null;

  const theme = professionTheme(profession?.color ?? profession?.specialty_color);

  const profileQuery = useUserProfile(user?.user_id);
  const walletQuery = useWallet(!!user);
  const tracksQuery = useTracks();

  const [missionType, setMissionType] = useState<'daily' | 'monthly'>('daily');
  const [tab, setTab] = useState<Tab>('available');
  const [difficultyFilter, setDifficultyFilter] = useState<MissionDifficulty | null>(null);

  // Abaixo de Recruta IV (nível 4 → 1500 XP): só missões fáceis, sem semanais.
  const isBelowRecruitIV = (user?.total_xp ?? 0) < XP_PER_RANK * 3;
  const forcedDifficulty = isBelowRecruitIV ? 'easy' : null;
  const effectiveDifficulty = forcedDifficulty ?? difficultyFilter;

  useEffect(() => {
    if (isBelowRecruitIV) {
      setDifficultyFilter(null);
      setMissionType('daily');
    }
  }, [isBelowRecruitIV]);

  const missionsEnabled = !!user && professionId != null;
  const availableQuery = useAvailableMissions(null, effectiveDifficulty, missionsEnabled, professionId);
  const inProgressActiveQuery = useMissions('in_progress', missionsEnabled, undefined, professionId);
  const pendingReviewQuery = useMissions('pending_review', missionsEnabled, undefined, professionId);

  const startM = useStartMission();
  const completeM = useCompleteMission();
  const abandonM = useAbandonMission();

  // Modais (mesmo fluxo da tela de Missões, sem o "compartilhar como post").
  const [celebration, setCelebration] = useState<{ xp: number; coins?: number } | null>(null);
  const [evidenceMission, setEvidenceMission] = useState<Mission | null>(null);
  const [rankUp, setRankUp] = useState<{ previous: string; current: string } | null>(null);
  const [legionModalVisible, setLegionModalVisible] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);

  // Imagem de uma patente pelo nome (ladder do perfil, estático por trilha).
  const rankImageByName = (name?: string): string | null => {
    if (!name) return null;
    const r = profileQuery.data?.ranks?.find((x) => x.name === name);
    return r?.image_url ?? r?.thumb_url ?? null;
  };

  // Detecta promoção pelo perfil (cobre finalização assíncrona média/difícil).
  const lastRankLevelRef = useRef<number | null>(null);
  useEffect(() => {
    const cr = profileQuery.data?.current_rank;
    if (!cr) return;
    const prev = lastRankLevelRef.current;
    if (prev != null && cr.level > prev) {
      const previousName = profileQuery.data?.ranks?.find((r) => r.level === prev)?.name ?? '';
      setRankUp({ previous: previousName, current: cr.name });
    }
    lastRankLevelRef.current = cr.level;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.data?.current_rank?.level]);

  const submitComplete = (mission: Mission, evidence?: MissionEvidence) => {
    completeM.mutate(
      { slug: mission.slug, evidence },
      {
        onSuccess: (result) => {
          setEvidenceMission(null);
          Vibration.vibrate(20);
          const rankedUp = result.status === 'completed' && result.promoted;
          if (result.status === 'completed' && !rankedUp) {
            setCelebration({ xp: result.xp_earned, coins: mission.coin_reward });
          }
          if (result.requires_legion_selection) {
            setRecommendedIds((result.recommended_legions ?? []).map((l) => l.id));
            setLegionModalVisible(true);
          }
        },
        onError: (err: Error) => {
          // Se o backend exigir prova (proof_type desatualizado no cache), abre o modal.
          if (!evidence && /eviden|proof|prova|comprov/i.test(err.message)) {
            setEvidenceMission(mission);
          }
        },
      },
    );
  };

  // Conclusão imediata (fácil) com prova em texto/`any`: preenche a evidência
  // automaticamente a partir das informações da missão (>= 20 chars). Imagem/link
  // ainda abrem o modal.
  const handleComplete = (mission: Mission) => {
    const proof = mission.proof_type;
    const isImmediate = mission.difficulty === 'easy';
    if (!proof || proof === 'none') {
      submitComplete(mission);
    } else if (isImmediate && (proof === 'text' || proof === 'any')) {
      submitComplete(mission, {
        text: buildAutoCompletionText(mission, t('missions.autoCompleteText', { name: mission.name })),
      });
    } else {
      setEvidenceMission(mission);
    }
  };

  const pendingSlug = startM.isPending
    ? startM.variables
    : completeM.isPending
      ? completeM.variables?.slug
      : null;
  const abandonPendingSlug = abandonM.isPending ? abandonM.variables : null;

  const availableMissions = sortByDifficulty(
    (availableQuery.data?.items ?? []).filter((m) => m.type === missionType),
  );
  const inProgressMissions = sortByDifficulty(
    Array.from(
      new Map(
        [...(inProgressActiveQuery.data ?? []), ...(pendingReviewQuery.data ?? [])].map((m) => [m.id, m]),
      ).values(),
    ),
  );

  const allowance = availableQuery.data?.availableMissions;
  const activeCount = missionType === 'daily' ? allowance?.daily : allowance?.weekly;

  const refreshing =
    tab === 'available'
      ? availableQuery.isRefetching
      : inProgressActiveQuery.isRefetching || pendingReviewQuery.isRefetching;

  const onRefresh = () => {
    if (tab === 'available') {
      availableQuery.refetch();
    } else {
      inProgressActiveQuery.refetch();
      pendingReviewQuery.refetch();
    }
  };

  const renderItem = (m: Mission) => (
    <MissionItem
      key={m.id}
      mission={m}
      accentColor={theme.base}
      onStart={(slug) => startM.mutate(slug)}
      onComplete={handleComplete}
      onAbandon={(mission) => abandonM.mutate(mission.slug)}
      onCompleted={(xp) => {
        Vibration.vibrate(30);
        setCelebration({ xp });
      }}
      trackLabel={tracksQuery.data?.find((tr) => tr.id === m.track_id)?.name}
      pending={pendingSlug === m.slug}
      abandonPending={abandonPendingSlug === m.slug}
    />
  );

  const availableLoading = availableQuery.isLoading;
  const inProgressLoading = inProgressActiveQuery.isLoading || pendingReviewQuery.isLoading;

  // Sem profissão resolvida ainda (query carregando) — evita render com dados nulos.
  if (!profession) {
    return (
      <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
        <Navbar />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#8B1A2B" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar
        rightExtra={walletQuery.data ? <WalletButton balance={walletQuery.data.balance} /> : null}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.base} />
        }>
        <ProfessionTopBar theme={theme} />

        <ProfessionCarousel
          professions={activeProfessions}
          currentId={profession.id}
          onSelect={setSelectedId}
        />

        <ProfessionInfoCard profession={profession} theme={theme} />

        <ProfessionTypeSelector
          theme={theme}
          missionType={missionType}
          onChangeType={setMissionType}
          allowance={allowance}
          activeCount={activeCount}
          isBelowRecruitIV={isBelowRecruitIV}
        />

        <ProfessionMissionsBox
          theme={theme}
          isBelowRecruitIV={isBelowRecruitIV}
          tab={tab}
          onChangeTab={setTab}
          difficultyFilter={difficultyFilter}
          onChangeDifficulty={setDifficultyFilter}
          availableLoading={availableLoading}
          availableError={availableQuery.isError}
          availableMissions={availableMissions}
          inProgressLoading={inProgressLoading}
          inProgressError={inProgressActiveQuery.isError || pendingReviewQuery.isError}
          inProgressMissions={inProgressMissions}
          renderItem={renderItem}
        />
      </ScrollView>

      <ProfessionModals
        userId={user?.user_id}
        legion={{
          visible: legionModalVisible,
          recommendedIds,
          onClose: () => setLegionModalVisible(false),
        }}
        evidence={{
          mission: evidenceMission,
          submitting: completeM.isPending,
          onClose: () => setEvidenceMission(null),
          onSubmit: (evidence) => evidenceMission && submitComplete(evidenceMission, evidence),
        }}
        celebration={{
          visible: celebration != null,
          xp: celebration?.xp ?? 0,
          coins: celebration?.coins,
          onDone: () => setCelebration(null),
        }}
        rankUp={{
          visible: rankUp != null,
          previousRank: rankUp?.previous,
          previousImage: rankImageByName(rankUp?.previous),
          newRank: rankUp?.current ?? '',
          newImage: rankImageByName(rankUp?.current),
          onClose: () => setRankUp(null),
        }}
      />
    </View>
  );
}
