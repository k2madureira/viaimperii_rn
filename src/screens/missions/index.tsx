import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, Vibration, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useUserProfessions } from '../market/model/queries/useProfessions';
import { useRewardedVideo } from './model/mutations/useRewardedVideo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionSelectModal, Navbar } from '../../components';
import { ArrowUpIcon, BellIcon, LockIcon, ShopIcon } from '../../components/icons';
import LogoIcon from '../../components/logoIcon';
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
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Keeps a persistent SSE connection open so mission status changes (approvals,
  // completions, new reviews) are reflected in real time without polling.

  useMissionEvents(!!user);

  const profileQuery = useUserProfile(user?.user_id);
  const userTrack = profileQuery.data?.track ?? null;
  const walletQuery = useWallet(!!user);
  const tracksQuery = useTracks();

  // Profissões adquiridas e ATIVAS do usuário — cada uma abre uma tela dedicada de
  // missões de profissão (só aparecem aqui quando há alguma desbloqueada).
  const userProfessionsQuery = useUserProfessions(user?.user_id, !!user);
  const activeProfessions = (userProfessionsQuery.data ?? [])
    .filter((up) => up.is_active)
    .map((up) => up.profession);
  const hasActiveProfessions = activeProfessions.length > 0;

  const [viewMode, setViewMode] = useState<ViewMode>('missions');
  const [period, setPeriod] = useState<StatsPeriod>('monthly');
  // C4: "Ativas" deixou de ser uma aba — virou um card colapsável (com badge) acima
  // da lista de Disponíveis, que passa a ser o foco. Este flag abre/fecha esse card.
  const [activeOpen, setActiveOpen] = useState(false);
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
  // Ação a executar SÓ quando o confete terminar (abrir legião/compartilhar) — evita
  // que o modal nativo cubra a animação de celebração.
  const afterCelebrationRef = useRef<(() => void) | null>(null);
  // F9: mini-tour na primeira visita (null = carregando o flag, evita flash).
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);
  const isReview = viewMode === 'review';
  const isProgress = viewMode === 'progress';
  // Modo "Missões" (não Progresso/Revisão) — mantém as ativas vivas p/ o badge de contagem.
  const inMissionsMode = !isReview && !isProgress;

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

  // Reinicia a paginação ao trocar de tipo, especialidade, nível ou modo de ordenação.
  useEffect(() => setVisible(PAGE_SIZE), [missionType, specialtyId, difficultyFilter, availableMode]);

  const isRecommended = availableMode === 'recommended';
  const hasActiveFilter = specialtyId != null || difficultyFilter != null;

  const statsQuery = useUserStats(user?.user_id, period);
  // Resumo do usuário logado (aba Progresso) — mesmo filtro de período.
  const summaryQuery = useUserSummary(period, isProgress);
  const specialtiesQuery = useSpecialties();
  // Mantida viva no modo Missões para o saldo/allowance (não no Progresso/Revisão).
  const availableQuery = useAvailableMissions(specialtyId, effectiveDifficulty, !isProgress);
  // Feed recomendado (content-based) — só no modo Missões e com ordenação recomendada.
  const recommendedQuery = useRecommendedMissions(
    specialtyId,
    effectiveDifficulty,
    missionType,
    !isProgress && !isReview && isRecommended,
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
  // C4/nav: mantido vivo também no modo Missões (não só na Revisão) para o badge de
  // "há missões para revisar" no acesso secundário. O SSE (new_review_available)
  // invalida esta chave, então a contagem fica atualizada.
  const toReviewQuery = useMissionsToReview(!isProgress);
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

  // Evidência enviada pelo usuário na conclusão — reaproveitada para pré-preencher
  // o post de compartilhamento (texto e link; imagem fica em bucket privado).
  const shareEvidenceRef = useRef<MissionEvidence | undefined>(undefined);

  // Texto inicial do post (editável): dados da missão + o que o usuário escreveu
  // como evidência (texto livre e/ou link), para não ter que digitar de novo.
  const buildShareText = (m: Mission, evidence?: MissionEvidence) => {
    const tag = m.specialty_name
      ? `#${m.specialty_name.toLowerCase().replace(/\s+/g, '')}`
      : '';
    // Ordem: frase da conquista → evidência (texto/link) → hashtag por último.
    const parts = [t('missionShare.template', { name: m.name })];
    const extraText = evidence?.text?.trim();
    const extraLink = evidence?.link?.trim();
    if (extraText) parts.push(extraText);
    if (extraLink) parts.push(extraLink);
    if (tag) parts.push(tag);
    return parts.join('\n\n');
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
          const showCelebration = result.status === 'completed' && !rankedUp;
          if (showCelebration) {
            setCelebration({ xp: result.xp_earned, coins: mission.coin_reward });
          }

          // Próxima ação (abrir modal): escolher legião (1ª missão) ou compartilhar.
          let next: (() => void) | null = null;
          if (result.requires_legion_selection) {
            const ids = (result.recommended_legions ?? []).map((l) => l.id);
            next = () => {
              setRecommendedIds(ids);
              setLegionModalVisible(true);
            };
          } else if (!rankedUp) {
            // Oferece compartilhar a conquista como post (revisar antes de publicar),
            // reaproveitando a evidência que o usuário digitou (texto/link).
            next = () => {
              shareEvidenceRef.current = evidence;
              setShareConfirm(mission);
            };
          }

          // Com confete, adia o modal até a animação terminar (não fica atrás dele).
          if (next) {
            if (showCelebration) {
              afterCelebrationRef.current = next;
            } else {
              next();
            }
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
  } else {
    // Modo Missões: lista de disponíveis + as ativas (card colapsável).
    refreshing =
      (isRecommended ? recommendedQuery.isRefetching : availableQuery.isRefetching) ||
      inProgressActiveQuery.isRefetching ||
      pendingReviewQuery.isRefetching;
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
    availableQuery.refetch();
    if (isRecommended) recommendedQuery.refetch();
    inProgressActiveQuery.refetch();
    pendingReviewQuery.refetch();
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
        {/* ── C4 (ação-first): a tela abre direto nas Missões. Progresso e Revisão
            deixam de ser abas de igual peso e viram ACESSO SECUNDÁRIO no topo; nos
            modos secundários, um "voltar" retorna às Missões. ─────────────────── */}
        {inMissionsMode ? (
          <View className="flex-row items-center justify-between gap-2">
            <Text
              className="text-[16px] font-extrabold text-charcoal"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {t('missions.tabMyMissions')}
            </Text>
            <View className="flex-row items-center gap-2">
              <SecondaryNav
                icon={ArrowUpIcon}
                label={t('missions.tabProgress')}
                onPress={() => setViewMode('progress')}
              />
              <SecondaryNav
                icon={BellIcon}
                label={t('missions.tabReview')}
                badge={toReviewQuery.data?.length}
                onPress={() => setViewMode('review')}
              />
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setViewMode('missions')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('missions.tabMyMissions')}
              className="w-8 h-8 rounded-full bg-[#efeaea] items-center justify-center">
              <Text className="text-[18px] font-bold text-primary-500">‹</Text>
            </TouchableOpacity>
            <Text
              className="text-[16px] font-extrabold text-charcoal"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {isReview ? t('missions.tabReview') : t('missions.tabProgress')}
            </Text>
          </View>
        )}

        {isReview ? (
          <ReviewSection
            query={toReviewQuery}
            onApprove={(slug, executorId) => approveM.mutate({ slug, executorId })}
            onReject={(slug, executorId, reason) => rejectM.mutate({ slug, executorId, reason })}
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

        {/* ── Opção 1: card HERO de missões de profissão (destaque no topo) ────
            Com profissão ativa: hero vinho + dourado com brilho, abre a tela dedicada.
            Bloqueado: teaser claro de upsell com CTA dourado → Mercado. */}
        <TouchableOpacity
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={t('missions.professionAccessTitle')}
          onPress={() =>
            hasActiveProfessions
              ? navigation.navigate('ProfessionMissions', { profession: activeProfessions[0] })
              : navigation.navigate('Market')
          }
          className="rounded-[18px] p-4 flex-row items-center gap-3.5 overflow-hidden"
          style={
            hasActiveProfessions
              ? { backgroundColor: '#6B1221', borderWidth: 1.5, borderColor: '#D4AF37' }
              : { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ece6e6' }
          }>
          {hasActiveProfessions && <SparkleOverlay radius={18} />}
          <View
            className="w-12 h-12 rounded-[14px] items-center justify-center"
            style={{ backgroundColor: hasActiveProfessions ? 'rgba(212,175,55,0.18)' : '#f7efdc' }}>
            {hasActiveProfessions ? (
              <LogoIcon size={26} color="#D4AF37" />
            ) : (
              <LockIcon size={22} color="#c8a24a" />
            )}
          </View>
          <View className="flex-1">
            <Text
              className="text-[15px] font-extrabold"
              style={{
                color: hasActiveProfessions ? '#fff' : '#3a2b2b',
                fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
              }}>
              {t('missions.professionAccessTitle')}
            </Text>
            <Text
              className="text-[12px] mt-0.5 leading-[16px]"
              style={{ color: hasActiveProfessions ? 'rgba(255,255,255,0.72)' : '#9a8f8f' }}>
              {hasActiveProfessions
                ? t('missions.professionAccessSubtitle')
                : t('missions.professionAccessLocked')}
            </Text>
          </View>
          {hasActiveProfessions ? (
            <Text className="text-[22px] font-bold" style={{ color: '#D4AF37' }}>›</Text>
          ) : (
            <View
              className="rounded-full px-3 py-2 flex-row items-center gap-1"
              style={{ backgroundColor: '#D4AF37' }}>
              <ShopIcon size={16} color="#6B1221" />
              <Text className="text-[11px] font-extrabold" style={{ color: '#6B1221' }}>
                {t('market.professions.buy')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Seletor de tipo (C4: leve, sem a caixa vinho pesada) ──────────── */}
        {!isBelowRecruitIV && (
          <View className="gap-2">
            <View className="flex-row bg-[#efeaea] rounded-[12px] p-1">
              <TypeTab
                label={t('missions.daily')}
                active={missionType === 'daily'}
                activeColor="#9a7b1f"
                count={allowance?.daily}
                onPress={() => setMissionType('daily')}
              />
              <TypeTab
                label={t('missions.weekly')}
                active={missionType === 'monthly'}
                activeColor="#2F7A52"
                count={allowance?.weekly}
                onPress={() => setMissionType('monthly')}
              />
            </View>

            {/* Reset timer + botão de vídeo quando a cota do tipo ativo esgota */}
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
        )}

        {/* Abaixo de Recruta IV só há diárias fáceis — sem seletor de tipo, mas ainda
            mostramos o aviso de cota esgotada + renovação/vídeo. */}
        {isBelowRecruitIV && allowance && activeAllowanceCount === 0 && activeResetAt && (
          <AllowanceBar
            remaining={0}
            max={10}
            resetAt={activeResetAt}
            label={t('missions.dailyMissionsLower')}
            rewardedVideoAvailable={allowance.rewarded_video_available ?? false}
            adState={adState}
            onWatchAd={watchAd}
          />
        )}

        {/* M3: os atalhos de profissão/loja saíram daqui (interrompiam o fluxo
            principal) e foram para o FIM do modo Missões, após a lista. */}

        {/* ── C4: "Ativas" vira card colapsável com badge (só quando há ativas),
            acima da lista de Disponíveis, que passa a ser o foco da tela. ──────── */}
        {inProgressMissions.length > 0 && (
          <View className="bg-white border border-[#f0eded] rounded-[20px] overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ expanded: activeOpen }}
              accessibilityLabel={t('missions.activeMissions')}
              onPress={() => setActiveOpen((o) => !o)}
              className="flex-row items-center justify-between px-4 py-3.5">
              <View className="flex-row items-center gap-2">
                <Text className="text-[14px]">🛡️</Text>
                <Text className="text-[14px] font-extrabold text-charcoal">
                  {t('missions.activeMissions')}
                </Text>
                <View className="bg-primary-500 rounded-full min-w-[20px] px-1.5 py-0.5 items-center">
                  <Text className="text-[11px] font-extrabold text-white leading-none">
                    {inProgressMissions.length > 99 ? '99+' : inProgressMissions.length}
                  </Text>
                </View>
              </View>
              <Text className="text-[12px] text-primary-500">{activeOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {activeOpen && (
              <View className="px-3 pb-3 gap-3">
                {inProgressLoading ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator color="#8B1A2B" />
                  </View>
                ) : inProgressError ? (
                  <ErrorBox text={t('missions.errorInProgress')} />
                ) : (
                  <View className="gap-3">{inProgressMissions.map(renderItem)}</View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ── Box: Disponíveis (foco da tela) ─────────────────────────────── */}
        <View className="bg-white border border-[#f0eded] rounded-[20px] overflow-hidden">
          <View className="p-3 gap-3">
            {/* C4/M5: ordenação recomendadas × catálogo é um controle DISCRETO
                (label do modo atual + link de troca), não uma faixa de abas. */}
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-[12px] text-[#888]">
                {isRecommended ? t('missions.recommendedCaption') : t('missions.allCaption')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={isRecommended ? t('missions.switchToAll') : t('missions.switchToRecommended')}
                onPress={() => setAvailableMode(isRecommended ? 'all' : 'recommended')}
                className="flex-row items-center gap-1 py-1">
                <Text className="text-[12px] font-bold text-primary-500">
                  {isRecommended ? t('missions.switchToAll') : t('missions.switchToRecommended')}
                </Text>
                <Text className="text-[11px] text-primary-500">⇄</Text>
              </TouchableOpacity>
            </View>

            {/* F4: filtros colapsados atrás de "Filtrar" — a tela abre já nas
                recomendadas, com menos ruído. Um ponto sinaliza filtro ativo. */}
            {(filteredSpecialties.length > 0 || !isBelowRecruitIV) && (
              <View className="gap-2.5">
                <TouchableOpacity
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: filtersOpen }}
                  accessibilityLabel={t('missions.filtersButton')}
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
          </View>
        </View>

        {/* Opção 4 (verificação): os cards de profissão/loja do FIM foram removidos —
            o acesso agora é a pílula dourada "Profissões" no header. */}
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
        onDone={() => {
          setCelebration(null);
          // Executa a ação adiada (abrir legião/compartilhar) após o confete.
          const next = afterCelebrationRef.current;
          afterCelebrationRef.current = null;
          next?.();
        }}
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

      {/* Compartilhar missão concluída como post (pré-preenchido com a evidência) */}
      <CreatePostModal
        key={shareMission?.slug ?? 'share-none'}
        visible={shareMission != null}
        initialText={shareMission ? buildShareText(shareMission, shareEvidenceRef.current) : ''}
        canLegion={profileQuery.data?.legion != null}
        canProvince={profileQuery.data?.province != null}
        authorAvatarUrl={
          profileQuery.data?.active_avatar?.thumb_url ??
          profileQuery.data?.active_avatar?.url ??
          null
        }
        onClose={() => {
          setShareMission(null);
          shareEvidenceRef.current = undefined;
        }}
      />
    </View>
  );
}

// Segmented control CLARO de tipo (Diárias/Semanais): ativo = pílula branca com o
// texto na cor do tipo; inativo = texto cinza sobre o trilho claro.
function TypeTab({
  label,
  active,
  activeColor = '#9a7b1f',
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
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={count != null ? `${label}, ${count}` : label}
      style={active ? { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px]`}>
      <Text className="text-[13px] font-bold" style={{ color: active ? activeColor : '#9a9a9a' }}>
        {label}
      </Text>
      {count != null && (
        <View
          className="px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: active ? `${activeColor}22` : '#e2dada' }}>
          <Text
            className="text-[10px] font-bold"
            style={{ color: exhausted ? '#bbb' : active ? activeColor : '#8a8a8a' }}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Forma de "brilho" (estrela de 4 pontas) usada nas partículas.
const SPARKLE_PATH =
  'M12 0 C13.2 8, 16 10.8, 24 12 C16 13.2, 13.2 16, 12 24 C10.8 16, 8 13.2, 0 12 C8 10.8, 10.8 8, 12 0 Z';

interface SparkleSpec {
  left: `${number}%`;
  top: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

// Uma estrela que pisca em loop: aparece (fade+scale+giro) e some, com atraso próprio.
function Sparkle({ left, top, size, color, delay, duration }: SparkleSpec) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(2000),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, delay, duration]);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left, top, opacity: v, transform: [{ scale }, { rotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={SPARKLE_PATH} fill={color} />
      </Svg>
    </Animated.View>
  );
}

// Estrelas cintilantes espalhadas pelo card (efeito "brilho"). Decorativo.
const SPARKLES: SparkleSpec[] = [
  { left: '10%', top: 8, size: 12, color: '#FFFFFF', delay: 0, duration: 2400 },
  { left: '30%', top: 30, size: 8, color: '#F2D98D', delay: 900, duration: 2200 },
  { left: '50%', top: 12, size: 10, color: '#D4AF37', delay: 1700, duration: 2600 },
  { left: '64%', top: 34, size: 7, color: '#FFFFFF', delay: 2400, duration: 2100 },
  { left: '80%', top: 10, size: 11, color: '#D4AF37', delay: 600, duration: 2500 },
  { left: '90%', top: 40, size: 8, color: '#F2D98D', delay: 1900, duration: 2300 },
  { left: '20%', top: 46, size: 9, color: '#D4AF37', delay: 3000, duration: 2200 },
];

function SparkleOverlay({ radius = 16 }: { radius?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: radius }}>
      {SPARKLES.map((s, i) => (
        <Sparkle key={i} {...s} />
      ))}
    </View>
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
    <View className="bg-accent-500/10 border border-accent-500/30 rounded-[12px] px-4 py-3 gap-2.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-[11px] font-semibold text-[#9a7b1f] uppercase tracking-[1px]">
            {label}
          </Text>
          <Text className="text-[13px] font-bold text-[#7a5b00] mt-0.5">{t('missions.quotaExhausted')}</Text>
        </View>
        {resetLabel && (
          <View className="bg-white border border-accent-500/20 rounded-[8px] px-3 py-1.5">
            <Text className="text-[11px] font-semibold text-[#7a5b00]">{resetLabel}</Text>
          </View>
        )}
      </View>

      {rewardedVideoAvailable && (
        <TouchableOpacity
          disabled={adButtonDisabled}
          activeOpacity={0.85}
          accessibilityRole="button"
          onPress={onWatchAd}
          className={`rounded-[9px] py-2.5 items-center flex-row justify-center gap-2 ${
            adButtonDisabled ? 'bg-[#e9dcae]' : 'bg-[#D4AF37]'
          }`}>
          {adState === 'loading' ? (
            <ActivityIndicator size="small" color="#7a5b00" />
          ) : null}
          <Text
            className={`text-[13px] font-bold ${adButtonDisabled ? 'text-[#9a7b1f]' : 'text-[#3d2900]'}`}>
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

// Acesso SECUNDÁRIO (C4 ação-first): pílula compacta com ícone + rótulo (e badge
// opcional) para Progresso/Revisão, sem competir com a ação principal (Missões).
function SecondaryNav({
  icon: Icon,
  label,
  badge,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  const hasBadge = badge != null && badge > 0;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hasBadge ? `${label}, ${badge}` : label}
      className="flex-row items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-full bg-white border border-[#ece6e6]">
      <Icon size={15} color="#6B1221" />
      <Text className="text-[12px] font-bold text-[#6B1221]">{label}</Text>
      {hasBadge && (
        <View className="bg-primary-500 rounded-full min-w-[18px] px-1 py-0.5 items-center">
          <Text className="text-[10px] font-extrabold text-white leading-none">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
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
  onReject: (slug: string, executorId: string, reason: string) => void;
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
