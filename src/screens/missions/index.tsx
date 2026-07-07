import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useRewardedVideo } from './model/mutations/useRewardedVideo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionSelectModal, Navbar } from '../../components';
import { Mission, MissionDifficulty, MissionEvidence, RecommendedMission, ToReviewItem } from '../../api/missions/missionsApi';
import { StatsPeriod } from '../../api/users/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { XP_PER_RANK } from '../../constants/game';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useWallet } from '../dashboard/model/queries/useWallet';
import WalletButton from '../dashboard/components/walletButton';
import { CreatePostModal } from '../dashboard/components/feed';
import { parseBackendDate } from '../../utils/date';

// Ordenação por dificuldade: fácil → médio → difícil (nulos por último).
const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
const sortByDifficulty = (list: Mission[]) =>
  [...list].sort(
    (a, b) =>
      (DIFFICULTY_ORDER[a.difficulty ?? ''] ?? 99) - (DIFFICULTY_ORDER[b.difficulty ?? ''] ?? 99),
  );
import {
  DailyGoalHeader,
  DifficultyFilter,
  LoadMoreButton,
  MissionItem,
  MissionCelebration,
  EvidenceModal,
  MissionsTab,
  MissionsTabs,
  MissionsOnboarding,
  PeriodStats,
  RankUpModal,
  ReviewItem,
  SpecialtyFilter,
  StatsFilter,
  UserSummary,
} from './components';

const PAGE_SIZE = 5;
import { useAbandonMission, useCompleteMission, useStartMission } from './model/mutations/useMissionMutations';
import { useJoinLegion } from './model/mutations/useJoinLegion';
import { useApproveMission } from './model/mutations/useApproveMission';
import { useRejectMission } from './model/mutations/useRejectMission';
import { useAvailableMissions } from './model/queries/useAvailableMissions';
import { useRecommendedMissions } from './model/queries/useRecommendedMissions';
import { useLegions } from './model/queries/useLegions';
import { useMissions } from './model/queries/useMissions';
import { useMissionsToReview } from './model/queries/useMissionsToReview';
import { useSpecialties } from './model/queries/useSpecialties';
import { useUserStats } from './model/queries/useUserStats';
import { useUserSummary } from './model/queries/useUserSummary';
import { useTracks } from '../ranks/model/queries/useTracks';
import { useMissionEvents } from './model/hooks/useMissionEvents';

type ViewMode = 'missions' | 'progress' | 'review';

const FIRST_TRACK_RANK: Record<string, string> = {
  legionarios: 'Legionary I',
  patricios: 'Discipulus I',
};

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Keeps a persistent SSE connection open so mission status changes (approvals,
  // completions, new reviews) are reflected in real time without polling.

  useMissionEvents(!!user);

  const profileQuery = useUserProfile(user?.user_id);
  const userTrack = profileQuery.data?.track ?? null;
  const walletQuery = useWallet(!!user);
  const tracksQuery = useTracks();

  const [viewMode, setViewMode] = useState<ViewMode>('missions');
  const [period, setPeriod] = useState<StatsPeriod>('monthly');
  const [tab, setTab] = useState<MissionsTab>('available');
  const [missionType, setMissionType] = useState<'daily' | 'monthly'>('daily');
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<MissionDifficulty | null>(null);
  // Aba "Disponíveis": ordena por recomendação (padrão) ou lista completa.
  const [availableMode, setAvailableMode] = useState<'recommended' | 'all'>('recommended');
  const [visible, setVisible] = useState(PAGE_SIZE);
  // F4: filtros de especialidade/nível colapsados por padrão (reduz o ruído visual).
  const [filtersOpen, setFiltersOpen] = useState(false);
  // F3: celebração ao creditar XP (request completed ou finalização por tempo/aprovação).
  const [celebration, setCelebration] = useState<{ xp: number; coins?: number } | null>(null);
  // F9: mini-tour na primeira visita (null = carregando o flag, evita flash).
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);
  const isReview = viewMode === 'review';
  const isProgress = viewMode === 'progress';
  // Modo "Missões" (não Progresso/Revisão) — mantém as ativas vivas p/ o badge de contagem.
  const inMissionsMode = !isReview && !isProgress;

  const isInProgress = tab === 'inprogress';

  // Abaixo de Recruta IV (nível 4 → 1500 XP), só missões de nível fácil.
  const isBelowRecruitIV = (user?.total_xp ?? 0) < XP_PER_RANK * 3;
  const forcedDifficulty = isBelowRecruitIV ? 'easy' : null;
  // Filtro de nível escolhido pelo usuário; ignorado quando a dificuldade é forçada.
  const effectiveDifficulty = forcedDifficulty ?? difficultyFilter;
  const unlockRankName = userTrack ? (FIRST_TRACK_RANK[userTrack.slug] ?? 'Legionary I / Discipulus I') : 'Legionary I / Discipulus I';

  // Sem trilha definida ainda força fácil — não há sentido em manter um filtro de nível pendente.
  useEffect(() => {
    if (isBelowRecruitIV) setDifficultyFilter(null);
  }, [isBelowRecruitIV]);

  // F9: carrega o flag do mini-tour uma vez (só mostra a quem nunca viu).
  useEffect(() => {
    SecureStore.getItemAsync('onboarding_missions_seen').then((v) => setOnboardingSeen(v === 'true'));
  }, []);
  const dismissOnboarding = () => {
    setOnboardingSeen(true);
    SecureStore.setItemAsync('onboarding_missions_seen', 'true');
  };

  // Reinicia a paginação ao trocar de aba, tipo, especialidade, nível ou modo.
  useEffect(() => setVisible(PAGE_SIZE), [tab, missionType, specialtyId, difficultyFilter, availableMode]);

  const isRecommended = availableMode === 'recommended';
  const hasActiveFilter = specialtyId != null || difficultyFilter != null;

  const statsQuery = useUserStats(user?.user_id, period);
  // Resumo do usuário logado (aba Progresso) — mesmo filtro de período.
  const summaryQuery = useUserSummary(period, isProgress);
  const specialtiesQuery = useSpecialties();
  // Mantida viva no modo Missões para o saldo/allowance (não no Progresso/Revisão).
  const availableQuery = useAvailableMissions(specialtyId, effectiveDifficulty, !isProgress);
  // Feed recomendado (content-based) — só quando a aba "Disponíveis" está em modo recomendado.
  const recommendedQuery = useRecommendedMissions(
    specialtyId,
    effectiveDifficulty,
    missionType,
    !isProgress && tab === 'available' && isRecommended,
  );
  // Catálogo completo (já filtrado por trilha no backend) — usado para derivar
  // quais especialidades pertencem à trilha do usuário, sem o efeito da cota diária.
  // Obs.: paginado (perPage=100) — não usar para achar missões específicas do usuário,
  // pois trilhas com mais de 100 missões (ex.: Patrícios, 132) truncariam o resultado.
  const catalogQuery = useMissions(undefined, true);
  // Histórico = missões concluídas (status=completed), mais recentes primeiro.
  // Agora vive na aba Progresso.
  const completedQuery = useMissions('completed', isProgress, {
    sortField: 'completed_at',
    sortOrder: 'desc',
  });
  // "Ativas" = em andamento + em revisão. Consultadas via filtro de status no backend
  // (em vez de derivar do catalogQuery paginado) para não perder missões do usuário
  // que ficariam fora da primeira página do catálogo.
  // Ativas ficam vivas em todo o modo Missões (não só na aba) para o badge de contagem.
  const inProgressActiveQuery = useMissions('in_progress', inMissionsMode);
  const pendingReviewQuery = useMissions('pending_review', inMissionsMode);

  // Fila de revisão de pares (só carrega quando o modo "Revisão" está ativo).
  const toReviewQuery = useMissionsToReview(isReview);
  const approveM = useApproveMission();

  const startM = useStartMission();
  const completeM = useCompleteMission();
  const abandonM = useAbandonMission();
  const joinLegionM = useJoinLegion(user?.user_id);
  const legionsQuery = useLegions();
  const { adState, watchAd } = useRewardedVideo();

  // Modal de escolha de legião (abre após a 1ª missão concluída sem legião).
  const [legionModalVisible, setLegionModalVisible] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<number[]>([]);
  // Modal de evidência (missões com proof_type != none).
  const [evidenceMission, setEvidenceMission] = useState<Mission | null>(null);
  // Missão em confirmação de "compartilhar como post" / missão sendo compartilhada.
  const [shareConfirm, setShareConfirm] = useState<Mission | null>(null);
  const [shareMission, setShareMission] = useState<Mission | null>(null);
  // Promoção de patente ao concluir (nomes das patentes anterior/nova).
  const [rankUp, setRankUp] = useState<{ previous: string; current: string } | null>(null);
  const rejectM = useRejectMission();

  // Imagem de uma patente pelo nome (do ladder do perfil — estático por trilha).
  const rankImageByName = (name?: string): string | null => {
    if (!name) return null;
    const r = profileQuery.data?.ranks?.find((x) => x.name === name);
    return r?.image_url ?? r?.thumb_url ?? null;
  };

  // Detecção de promoção pelo perfil: cobre a finalização ASSÍNCRONA (média/difícil
  // por tempo/aprovação), que não traz `promoted` no poll. Quando o `current_rank.level`
  // sobe entre refetches, dispara o modal (a patente anterior vem do ladder pelo nível).
  const lastRankLevelRef = useRef<number | null>(null);
  useEffect(() => {
    const cr = profileQuery.data?.current_rank;
    if (!cr) return;
    const level = cr.level;
    const prev = lastRankLevelRef.current;
    if (prev != null && level > prev) {
      const previousName = profileQuery.data?.ranks?.find((r) => r.level === prev)?.name ?? '';
      setRankUp({ previous: previousName, current: cr.name });
    }
    lastRankLevelRef.current = level;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.data?.current_rank?.level]);

  // Texto inicial do post (editável) a partir dos dados da missão.
  const buildShareText = (m: Mission) => {
    const tag = m.specialty_name
      ? ` #${m.specialty_name.toLowerCase().replace(/\s+/g, '')}`
      : '';
    return t('missionShare.template', { name: m.name }) + tag;
  };

  const submitComplete = (mission: Mission, evidence?: MissionEvidence) => {
    completeM.mutate(
      { slug: mission.slug, evidence },
      {
        onSuccess: (result) => {
          setEvidenceMission(null);
          // Feedback tátil ao enviar a conclusão.
          Vibration.vibrate(20);
          // Se subiu de patente na conclusão imediata, o modal de promoção vem do
          // watch de perfil (single source) — aqui só evitamos ruído (celebração/
          // compartilhar) sobre esse momento maior.
          const rankedUp = result.status === 'completed' && result.promoted;
          if (result.status === 'completed' && !rankedUp) {
            setCelebration({ xp: result.xp_earned, coins: mission.coin_reward });
          }
          if (result.requires_legion_selection) {
            setRecommendedIds((result.recommended_legions ?? []).map((l) => l.id));
            setLegionModalVisible(true);
          } else if (!rankedUp) {
            // Oferece compartilhar a conquista como post (revisar antes de publicar).
            setShareConfirm(mission);
          }
        },
        onError: (err: Error) => {
          // Recuperação: se o backend exigir prova (proof_type desatualizado no cache
          // da listagem), abre o modal de evidência em vez de só falhar.
          if (!evidence && /eviden|proof|prova|comprov/i.test(err.message)) {
            setEvidenceMission(mission);
          }
        },
      },
    );
  };

  // Concluir: missões com evidência abrem o modal; as demais concluem direto.
  const handleComplete = (mission: Mission) => {
    if (mission.proof_type && mission.proof_type !== 'none') {
      setEvidenceMission(mission);
    } else {
      submitComplete(mission);
    }
  };

  const pendingSlug = startM.isPending
    ? startM.variables
    : completeM.isPending
      ? completeM.variables?.slug
      : null;
  const abandonPendingSlug = abandonM.isPending ? abandonM.variables : null;

  const allAvailable = availableQuery.data?.items ?? [];
  const availableMissions = sortByDifficulty(allAvailable.filter((m) => m.type === missionType));
  // Recomendadas já vêm ranqueadas por score no backend — preserva a ordem (sem re-sort).
  const recommendedMissions = (recommendedQuery.data?.items ?? []).filter((m) => m.type === missionType);

  // Especialidades da trilha do usuário (derivadas do catálogo completo, não da
  // lista capada pela cota). Sem trilha definida → mostra todas.
  const trackSpecialtyIds = new Set(
    (catalogQuery.data ?? []).map((m) => m.specialty_id).filter((id): id is number => id != null),
  );
  const filteredSpecialties = (specialtiesQuery.data ?? []).filter(
    (s) => !userTrack || trackSpecialtyIds.has(s.id),
  );
  const allowance = availableQuery.data?.availableMissions;
  const activeAllowanceCount = missionType === 'daily' ? (allowance?.daily ?? null) : (allowance?.weekly ?? null);
  const activeResetAt = missionType === 'daily' ? allowance?.daily_reset_at : allowance?.weekly_reset_at;
  // Já ordenado por data de conclusão (desc) no backend.
  const historyMissions = completedQuery.data ?? [];

  // Deduplica por id: as duas queries são invalidadas juntas (['missions']) quando o
  // status de uma missão muda, então pode haver uma janela em que a mesma missão
  // ainda aparece na lista antiga (stale) e já aparece na nova — o Map mantém só a
  // última ocorrência (a mais recente, já que pendingReview vem depois no spread).
  const inProgressMissions = sortByDifficulty(
    Array.from(
      new Map(
        [...(inProgressActiveQuery.data ?? []), ...(pendingReviewQuery.data ?? [])].map((m) => [
          m.id,
          m,
        ]),
      ).values(),
    ),
  );
  const inProgressLoading = inProgressActiveQuery.isLoading || pendingReviewQuery.isLoading;
  const inProgressError = inProgressActiveQuery.isError || pendingReviewQuery.isError;

  const historyLoading =  completedQuery.isLoading;
  const historyError =  completedQuery.isError;

  let refreshing = statsQuery.isRefetching;

  if (isReview) {
    refreshing = toReviewQuery.isRefetching;
  } else if (isProgress) {
    refreshing =
      statsQuery.isRefetching || summaryQuery.isRefetching || completedQuery.isRefetching;
  } else if(isInProgress){
    refreshing = inProgressActiveQuery.isRefetching || pendingReviewQuery.isRefetching;
  } else {
    refreshing = isRecommended ? recommendedQuery.isRefetching : availableQuery.isRefetching;
  }

  const onRefresh = () => {
    if (isReview) {
      toReviewQuery.refetch();
      return;
    }
    if (isProgress) {
      statsQuery.refetch();
      summaryQuery.refetch();
      completedQuery.refetch();
      return;
    }
    if (isInProgress) {
      inProgressActiveQuery.refetch();
      pendingReviewQuery.refetch();
    } else if (isRecommended) {
      recommendedQuery.refetch();
      availableQuery.refetch();
    } else {
      availableQuery.refetch();
    }
  };

  const renderItem = (m: Mission) => (
    <MissionItem
      key={m.id}
      mission={m}
      onStart={(slug) => startM.mutate(slug)}
      onComplete={handleComplete}
      onAbandon={(mission) => abandonM.mutate(mission.slug)}
      onCompleted={(xp) => {
        Vibration.vibrate(30);
        setCelebration({ xp });
      }}
      reasons={(m as Partial<RecommendedMission>).reasons}
      trackLabel={tracksQuery.data?.find((tr) => tr.id === m.track_id)?.name}
      pending={pendingSlug === m.slug}
      abandonPending={abandonPendingSlug === m.slug}
    />
  );

  // Mostra `visible` missões + botão "Buscar mais" enquanto houver restantes.
  const renderList = (list: Mission[]) => {
    const remaining = list.length - visible;
    return (
      <View className="gap-3">
        {list.slice(0, visible).map(renderItem)}
        {remaining > 0 && (
          <LoadMoreButton
            remaining={remaining}
            onPress={() => setVisible((v) => v + PAGE_SIZE)}
          />
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar
        rightExtra={walletQuery.data ? <WalletButton balance={walletQuery.data.balance} /> : null}
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B1A2B" />
        }>
        {/* ── Troca de abas: Missões | Progresso | Revisão ────────────────── */}
        <View className="flex-row bg-[#efeaea] rounded-[12px] p-1">
          <ModeTab
            label={t('missions.tabMyMissions')}
            active={viewMode === 'missions'}
            onPress={() => setViewMode('missions')}
          />
          <ModeTab
            label={t('missions.tabProgress')}
            active={isProgress}
            onPress={() => setViewMode('progress')}
          />
          <ModeTab
            label={t('missions.tabReview')}
            active={isReview}
            badge={toReviewQuery.data?.length}
            onPress={() => setViewMode('review')}
          />
        </View>

        {isReview ? (
          <ReviewSection
            query={toReviewQuery}
            onApprove={(slug, executorId) => approveM.mutate({ slug, executorId })}
            onReject={(slug, executorId) => rejectM.mutate({ slug, executorId })}
            pendingSlug={
              approveM.isPending
                ? approveM.variables?.slug ?? null
                : rejectM.isPending
                  ? rejectM.variables?.slug ?? null
                  : null
            }
          />
        ) : isProgress ? (
          /* Aba "Progresso": resumo do usuário + estatísticas + histórico. */
          <>
            <StatsFilter value={period} onChange={setPeriod} />
            <UserSummary summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />
            <PeriodStats stats={statsQuery.data} isLoading={statsQuery.isLoading} />

            <View className="bg-white border border-[#f0eded] rounded-[20px] p-3 gap-3">
              <Text className="text-[14px] font-extrabold text-charcoal px-1 pt-1">
                {t('missions.historyTitle')}
              </Text>
              {historyLoading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator color="#8B1A2B" />
                </View>
              ) : historyError ? (
                <ErrorBox text={t('missions.errorHistory')} />
              ) : historyMissions.length === 0 ? (
                <EmptyBox text={t('missions.emptyHistory')} emoji="📜" />
              ) : (
                renderList(historyMissions)
              )}
            </View>
          </>
        ) : (
        <>
        {/* Meta diária + ofensiva (F2) */}
        <DailyGoalHeader allowance={allowance} streak={user?.streak} />

        {/* ── Seletor de tipo: Diárias | Semanais ────────────────────────── */}
        <View className="bg-[#6B1221] rounded-[16px] p-4 gap-3">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase">
                {t('missions.missionType')}
              </Text>
              <Text
                className="text-[18px] font-extrabold text-white mt-0.5"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {missionType === 'daily' ? t('missions.dailyMissions') : t('missions.weeklyMissions')}
              </Text>
            </View>
            {allowance && activeAllowanceCount != null && (
              <View className={`px-3 py-1.5 rounded-full ${
                activeAllowanceCount === 0 ? 'bg-white/10' : missionType === 'daily' ? 'bg-accent-500' : 'bg-laurel'
              }`}>
                <Text className={`text-[11px] font-bold ${activeAllowanceCount === 0 ? 'text-white/40' : 'text-white'}`}>
                  {activeAllowanceCount === 0
                    ? t('missions.exhausted')
                    : t('missions.remaining', { count: activeAllowanceCount })}
                </Text>
              </View>
            )}
          </View>

          {/* Abas de tipo */}
          <View className="flex-row bg-white/10 rounded-[10px] p-1">
            <TypeTab
              label={t('missions.daily')}
              active={missionType === 'daily'}
              activeColor="#D4AF37"
              count={allowance?.daily}
              onPress={() => setMissionType('daily')}
            />
            {!isBelowRecruitIV && (
              <TypeTab
                label={t('missions.weekly')}
                active={missionType === 'monthly'}
                activeColor="#2F7A52"
                count={allowance?.weekly}
                onPress={() => setMissionType('monthly')}
              />
            )}
          </View>

          {/* Reset timer + botão de vídeo quando cota esgotada */}
          {allowance && activeAllowanceCount === 0 && activeResetAt && (
            <AllowanceBar
              remaining={0}
              max={missionType === 'daily' ? 10 : 2}
              resetAt={activeResetAt}
              label={missionType === 'daily' ? t('missions.dailyMissionsLower') : t('missions.weeklyMissionsLower')}
              rewardedVideoAvailable={
                missionType === 'daily' && (allowance.rewarded_video_available ?? false)
              }
              adState={adState}
              onWatchAd={watchAd}
            />
          )}
        </View>

        {/* ── Box: status + conteúdo ──────────────────────────────────────── */}
        <View className="bg-white border border-[#f0eded] rounded-[20px] overflow-hidden">
          {/* Tabs de status */}
          <View className="px-3 pt-3">
            <MissionsTabs
              value={tab}
              onChange={setTab}
              missionType={missionType}
              activeCount={inProgressMissions.length}
            />
          </View>

          <View className="p-3 gap-3">
            {tab === 'available' && (
              <>
                {/* Modo de ordenação: recomendadas (personalizado) x lista completa. */}
                <View className="flex-row bg-[#f4f4f4] rounded-[10px] p-1">
                  <SortModeTab
                    label={t('missions.tabRecommended')}
                    active={isRecommended}
                    onPress={() => setAvailableMode('recommended')}
                  />
                  <SortModeTab
                    label={t('missions.tabAll')}
                    active={!isRecommended}
                    onPress={() => setAvailableMode('all')}
                  />
                </View>

                {/* F4: filtros colapsados atrás de "Filtrar" — a tela abre já nas
                    recomendadas, com menos ruído. Um ponto sinaliza filtro ativo. */}
                {(filteredSpecialties.length > 0 || !isBelowRecruitIV) && (
                  <View className="gap-2.5">
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setFiltersOpen((o) => !o)}
                      className="flex-row items-center justify-center gap-1.5 py-2 rounded-[10px] bg-[#f4f4f4]">
                      <Text className="text-[12px] font-bold text-[#666]">
                        {t('missions.filtersButton')}
                      </Text>
                      {hasActiveFilter && <View className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                      <Text className="text-[11px] text-[#888]">{filtersOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {filtersOpen && (
                      <View className="gap-3">
                        {filteredSpecialties.length > 0 && (
                          <SpecialtyFilter
                            specialties={filteredSpecialties}
                            value={specialtyId}
                            onChange={setSpecialtyId}
                          />
                        )}
                        {!isBelowRecruitIV && (
                          <DifficultyFilter value={difficultyFilter} onChange={setDifficultyFilter} />
                        )}
                      </View>
                    )}
                  </View>
                )}

                {isBelowRecruitIV && (
                  <View className="bg-accent-500/15 border border-accent-500/40 rounded-[12px] px-4 py-3 flex-row items-center gap-2">
                    <Text className="text-[14px]">⚔️</Text>
                    <Text className="flex-1 text-[12px] text-[#7a5b00] leading-[18px]">
                      {t('missions.belowRecruitInfo', { rank: unlockRankName })}
                    </Text>
                  </View>
                )}

                {isRecommended ? (
                  recommendedQuery.isLoading ? (
                    <View className="py-12 items-center">
                      <ActivityIndicator color="#8B1A2B" />
                    </View>
                  ) : recommendedQuery.isError ? (
                    <ErrorBox text={t('missions.errorRecommended')} />
                  ) : recommendedMissions.length === 0 ? (
                    <EmptyBox text={t('missions.emptyAvailable')} emoji="⚔️" />
                  ) : (
                    renderList(recommendedMissions)
                  )
                ) : availableQuery.isLoading ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator color="#8B1A2B" />
                  </View>
                ) : availableQuery.isError ? (
                  <ErrorBox text={t('missions.errorAvailable')} />
                ) : availableMissions.length === 0 ? (
                  <EmptyBox text={t('missions.emptyAvailable')} emoji="⚔️" />
                ) : (
                  renderList(availableMissions)
                )}
              </>
            )}

            {tab === 'inprogress' && (
              <>
                {inProgressLoading ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator color="#8B1A2B" />
                  </View>
                ) : inProgressError ? (
                  <ErrorBox text={t('missions.errorInProgress')} />
                ) : inProgressMissions.length === 0 ? (
                  <EmptyBox text={t('missions.emptyInProgress')} emoji="🛡️" />
                ) : (
                  renderList(inProgressMissions)
                )}
              </>
            )}

          </View>
        </View>
        </>
        )}
      </ScrollView>

      <LegionSelectModal
        visible={legionModalVisible}
        legions={legionsQuery.data ?? []}
        recommendedIds={recommendedIds}
        pending={joinLegionM.isPending}
        onClose={() => setLegionModalVisible(false)}
        onConfirm={(legionId) =>
          joinLegionM.mutate(legionId, {
            onSuccess: () => setLegionModalVisible(false),
          })
        }
      />

      <EvidenceModal
        mission={evidenceMission}
        submitting={completeM.isPending}
        onClose={() => setEvidenceMission(null)}
        onSubmit={(evidence) => evidenceMission && submitComplete(evidenceMission, evidence)}
      />

      {/* F3: celebração de XP (camada absoluta, não bloqueia toques). */}
      <MissionCelebration
        visible={celebration != null}
        xp={celebration?.xp ?? 0}
        coins={celebration?.coins}
        onDone={() => setCelebration(null)}
      />

      {/* F9: mini-tour na primeira visita */}
      <MissionsOnboarding visible={onboardingSeen === false} onClose={dismissOnboarding} />

      {/* Promoção de patente ao concluir missão */}
      <RankUpModal
        visible={rankUp != null}
        previousRank={rankUp?.previous}
        previousImage={rankImageByName(rankUp?.previous)}
        newRank={rankUp?.current ?? ''}
        newImage={rankImageByName(rankUp?.current)}
        onClose={() => setRankUp(null)}
      />

      {/* Confirmação: transformar a conclusão em post (modal padrão do app) */}
      <Modal
        visible={shareConfirm != null}
        transparent
        animationType="fade"
        onRequestClose={() => setShareConfirm(null)}>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full bg-white rounded-[20px] p-6">
            <View className="items-center">
              <View className="w-14 h-14 rounded-full bg-primary-500/10 items-center justify-center mb-3">
                <Text className="text-[26px]">📣</Text>
              </View>
              <Text
                className="text-[18px] font-extrabold text-charcoal text-center"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {t('missionShare.promptTitle')}
              </Text>
            </View>
            <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
              {t('missionShare.promptBody')}
            </Text>
            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={() => setShareConfirm(null)}
                activeOpacity={0.85}
                className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                <Text className="text-[14px] font-bold text-[#666]">{t('missionShare.decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const m = shareConfirm;
                  setShareConfirm(null);
                  if (m) setShareMission(m);
                }}
                activeOpacity={0.9}
                className="flex-1 bg-primary-500 rounded-[12px] py-3 items-center">
                <Text className="text-[14px] font-bold text-white">{t('missionShare.accept')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Compartilhar missão concluída como post (pré-preenchido, editável) */}
      <CreatePostModal
        key={shareMission?.slug ?? 'share-none'}
        visible={shareMission != null}
        initialText={shareMission ? buildShareText(shareMission) : ''}
        canLegion={profileQuery.data?.legion != null}
        canProvince={profileQuery.data?.province != null}
        authorAvatarUrl={
          profileQuery.data?.active_avatar?.thumb_url ??
          profileQuery.data?.active_avatar?.url ??
          null
        }
        onClose={() => setShareMission(null)}
      />
    </View>
  );
}

function TypeTab({
  label,
  active,
  activeColor = '#9E1B32',
  count,
  onPress,
}: {
  label: string;
  active: boolean;
  activeColor?: string;
  count?: number;
  onPress: () => void;
}) {
  const exhausted = count === 0;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={active ? { backgroundColor: activeColor } : undefined}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px]`}>
      <Text className={`text-[13px] font-bold ${active ? 'text-white' : 'text-white/50'}`}>
        {label}
      </Text>
      {count != null && (
        <View className={`px-1.5 py-0.5 rounded-full ${exhausted ? 'bg-white/10' : 'bg-white/25'}`}>
          <Text className={`text-[10px] font-bold ${exhausted ? 'text-white/30' : 'text-white'}`}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function AllowanceBar({
  remaining,
  max,
  resetAt,
  label,
  rewardedVideoAvailable = false,
  adState = 'idle',
  onWatchAd,
}: {
  remaining: number;
  max: number;
  resetAt?: string;
  label: string;
  rewardedVideoAvailable?: boolean;
  adState?: 'idle' | 'loading' | 'ready' | 'showing' | 'error';
  onWatchAd?: () => void;
}) {
  const { t } = useTranslation();
  const resetLabel = React.useMemo(() => {
    if (!resetAt) return null;
    const reset = parseBackendDate(resetAt);
    if (!reset) return null;
    const now = new Date();
    const diffMs = reset.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffM = Math.floor((diffMs % 3_600_000) / 60_000);
    if (diffH >= 24) {
      const days = Math.ceil(diffH / 24);
      return t('missions.renewInDays', { count: days });
    }
    if (diffH > 0) {
      return diffM > 0
        ? t('missions.renewInHoursMinutes', { hours: diffH, minutes: diffM })
        : t('missions.renewInHours', { hours: diffH });
    }
    return t('missions.renewInMinutes', { minutes: diffM });
  }, [resetAt, t]);

  const adButtonLabel =
    adState === 'loading' ? t('missions.adLoading')
    : adState === 'showing' ? t('missions.adWatching')
    : t('missions.adWatch');

  const adButtonDisabled = adState === 'loading' || adState === 'showing';

  return (
    <View className="bg-white/10 rounded-[10px] px-4 py-3 gap-2.5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] font-semibold text-white/40 uppercase tracking-[1px]">
            {label}
          </Text>
          <Text className="text-[13px] font-bold text-white/50 mt-0.5">{t('missions.quotaExhausted')}</Text>
        </View>
        {resetLabel && (
          <View className="bg-white/15 rounded-[8px] px-3 py-1.5">
            <Text className="text-[11px] font-semibold text-white/70">{resetLabel}</Text>
          </View>
        )}
      </View>

      {rewardedVideoAvailable && (
        <TouchableOpacity
          disabled={adButtonDisabled}
          activeOpacity={0.85}
          onPress={onWatchAd}
          className={`rounded-[9px] py-2.5 items-center flex-row justify-center gap-2 ${
            adButtonDisabled ? 'bg-white/10' : 'bg-[#D4AF37]'
          }`}>
          {adState === 'loading' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : null}
          <Text
            className={`text-[13px] font-bold ${adButtonDisabled ? 'text-white/30' : 'text-[#3d2900]'}`}>
            {adButtonLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptyBox({ text, emoji = '🏛️' }: { text: string; emoji?: string }) {
  return (
    <View className="bg-white border border-[#f0eded] rounded-[14px] py-10 items-center px-6">
      <Text className="text-[26px] mb-2">{emoji}</Text>
      <Text className="text-[13px] text-[#777] text-center leading-[18px]">{text}</Text>
    </View>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <View className="bg-white border border-[#f0eded] rounded-[14px] py-10 items-center px-6">
      <Text className="text-[13px] text-[#c0392b] text-center">{text}</Text>
    </View>
  );
}

function ModeTab({
  label,
  active,
  badge,
  onPress,
}: {
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px] ${active ? 'bg-white' : ''}`}
      style={active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}>
      <Text className={`text-[13px] font-bold ${active ? 'text-primary-500' : 'text-[#888]'}`}>
        {label}
      </Text>
      {badge != null && badge > 0 && (
        <View className="bg-primary-500 rounded-full px-1.5 py-0.5 min-w-[18px] items-center">
          <Text className="text-[10px] font-bold text-white">{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function SortModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-1 py-2 rounded-[8px] items-center ${active ? 'bg-white' : ''}`}
      style={active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}>
      <Text className={`text-[12px] font-bold ${active ? 'text-primary-500' : 'text-[#aaa]'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ReviewSection({
  query,
  onApprove,
  onReject,
  pendingSlug,
}: {
  query: { isLoading: boolean; isError: boolean; data?: ToReviewItem[] };
  onApprove: (slug: string, executorId: string) => void;
  onReject: (slug: string, executorId: string) => void;
  pendingSlug: string | null;
}) {
  const { t } = useTranslation();
  const items = query.data ?? [];
  return (
    <View className="bg-white border border-[#f0eded] rounded-[20px] p-3 gap-3">
      <View className="px-1 pt-1">
        <Text className="text-[14px] font-extrabold text-charcoal">{t('missions.reviewWaiting')}</Text>
        <Text className="text-[11px] text-[#999] mt-0.5 leading-[15px]">
          {t('missions.reviewDescription')}
        </Text>
      </View>

      {query.isLoading ? (
        <View className="py-12 items-center">
          <ActivityIndicator color="#8B1A2B" />
        </View>
      ) : query.isError ? (
        <ErrorBox text={t('missions.errorReview')} />
      ) : items.length === 0 ? (
        <EmptyBox text={t('missions.emptyReview')} emoji="✅" />
      ) : (
        <View className="gap-3">
          {items.map((item) => (
            <ReviewItem
              key={`${item.mission_slug}-${item.executor.id}`}
              item={item}
              onApprove={onApprove}
              onReject={onReject}
              pending={pendingSlug === item.mission_slug}
            />
          ))}
        </View>
      )}
    </View>
  );
}
