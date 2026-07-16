import React, { useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Vibration, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { Mission, MissionDifficulty, MissionEvidence, RecommendedMission } from '../../api/missions/missionsApi';
import { StatsPeriod } from '../../api/users/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { XP_PER_RANK } from '../../constants/game';
import { FIRST_TRACK_RANK, PAGE_SIZE, sortByDifficulty } from '../../constants/missions';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useWallet } from '../dashboard/model/queries/useWallet';
import WalletButton from '../dashboard/components/walletButton';
import { buildAutoCompletionText } from '../../utils/missionEvidence';
import { DailyGoalHeader, LoadMoreButton, MissionItem } from './components';
import {
  ActiveMissionsCard,
  AvailableMissionsBox,
  MissionsHeader,
  MissionsModals,
  MissionTypeSelector,
  ProfessionHero,
  ProgressSection,
  ReviewSection,
} from './components/sections';
import { useAbandonMission, useCompleteMission, useStartMission } from './model/mutations/useMissionMutations';
import { useAvailableMissions } from './model/queries/useAvailableMissions';
import { useRecommendedMissions } from './model/queries/useRecommendedMissions';
import { useMissions } from './model/queries/useMissions';
import { useMissionsToReview } from './model/queries/useMissionsToReview';
import { useSpecialties } from './model/queries/useSpecialties';
import { useUserStats } from './model/queries/useUserStats';
import { useUserSummary } from './model/queries/useUserSummary';
import { useTracks } from '../ranks/model/queries/useTracks';
import { useMissionEvents } from './model/hooks/useMissionEvents';

type ViewMode = 'missions' | 'progress' | 'review';

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

  const startM = useStartMission();
  const completeM = useCompleteMission();
  const abandonM = useAbandonMission();

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
  // Exceção — CONCLUSÃO IMEDIATA (fácil) com prova em texto/`any`: preenche a evidência
  // automaticamente a partir das informações da missão (>= 20 chars), atendendo o
  // prerequisito sem abrir o modal. Provas de imagem/link ainda exigem o modal.
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

  const historyLoading = completedQuery.isLoading;
  const historyError = completedQuery.isError;

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
        <MissionsHeader
          inMissionsMode={inMissionsMode}
          isReview={isReview}
          reviewBadge={toReviewQuery.data?.length}
          onReopenOnboarding={() => setOnboardingSeen(false)}
          onOpenProgress={() => setViewMode('progress')}
          onOpenReview={() => setViewMode('review')}
          onBackToMissions={() => setViewMode('missions')}
        />

        {isReview ? (
          <ReviewSection query={toReviewQuery} />
        ) : isProgress ? (
          <ProgressSection
            period={period}
            onChangePeriod={setPeriod}
            summary={summaryQuery.data}
            summaryLoading={summaryQuery.isLoading}
            stats={statsQuery.data}
            statsLoading={statsQuery.isLoading}
            historyLoading={historyLoading}
            historyError={historyError}
            historyMissions={historyMissions}
            renderList={renderList}
          />
        ) : (
          <>
            {/* Meta diária + ofensiva (F2) */}
            <DailyGoalHeader allowance={allowance} streak={user?.streak} />

            <ProfessionHero />

            <MissionTypeSelector
              isBelowRecruitIV={isBelowRecruitIV}
              missionType={missionType}
              onChangeType={setMissionType}
              allowance={allowance}
              activeAllowanceCount={activeAllowanceCount}
              activeResetAt={activeResetAt}
            />

            <ActiveMissionsCard
              missions={inProgressMissions}
              isLoading={inProgressLoading}
              isError={inProgressError}
              open={activeOpen}
              onToggle={() => setActiveOpen((o) => !o)}
              renderItem={renderItem}
            />

            <AvailableMissionsBox
              isRecommended={isRecommended}
              onToggleMode={() => setAvailableMode(isRecommended ? 'all' : 'recommended')}
              filtersOpen={filtersOpen}
              onToggleFilters={() => setFiltersOpen((o) => !o)}
              hasActiveFilter={hasActiveFilter}
              isBelowRecruitIV={isBelowRecruitIV}
              unlockRankName={unlockRankName}
              filteredSpecialties={filteredSpecialties}
              specialtyId={specialtyId}
              onChangeSpecialty={setSpecialtyId}
              difficultyFilter={difficultyFilter}
              onChangeDifficulty={setDifficultyFilter}
              recommendedQuery={recommendedQuery}
              recommendedMissions={recommendedMissions}
              availableQuery={availableQuery}
              availableMissions={availableMissions}
              renderList={renderList}
            />
          </>
        )}
      </ScrollView>

      <MissionsModals
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
          onDone: () => {
            setCelebration(null);
            // Executa a ação adiada (abrir legião/compartilhar) após o confete.
            const next = afterCelebrationRef.current;
            afterCelebrationRef.current = null;
            next?.();
          },
        }}
        onboarding={{
          visible: onboardingSeen === false,
          onClose: dismissOnboarding,
        }}
        rankUp={{
          visible: rankUp != null,
          previousRank: rankUp?.previous,
          previousImage: rankImageByName(rankUp?.previous),
          newRank: rankUp?.current ?? '',
          newImage: rankImageByName(rankUp?.current),
          onClose: () => setRankUp(null),
        }}
        shareConfirm={{
          visible: shareConfirm != null,
          onDecline: () => setShareConfirm(null),
          onAccept: () => {
            const m = shareConfirm;
            setShareConfirm(null);
            if (m) setShareMission(m);
          },
        }}
        createPost={{
          keyId: shareMission?.slug ?? 'share-none',
          visible: shareMission != null,
          initialText: shareMission ? buildShareText(shareMission, shareEvidenceRef.current) : '',
          canLegion: profileQuery.data?.legion != null,
          canProvince: profileQuery.data?.province != null,
          authorAvatarUrl:
            profileQuery.data?.active_avatar?.thumb_url ??
            profileQuery.data?.active_avatar?.url ??
            null,
          onClose: () => {
            setShareMission(null);
            shareEvidenceRef.current = undefined;
          },
        }}
      />
    </View>
  );
}
