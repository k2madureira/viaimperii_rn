import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LegionSelectModal, Navbar } from '../../../components';
import { ShopIcon } from '../../../components/icons';
import { Mission, MissionDifficulty, MissionEvidence } from '../../../api/missions/missionsApi';
import { Profession } from '../../../api/professions/professionsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { XP_PER_RANK } from '../../../constants/game';
import { professionTheme, withAlpha } from '../../../utils/color';
import { buildAutoCompletionText } from '../../../utils/missionEvidence';
import { MissionsStackParamList } from '../../../navigation/MissionsStack';
import { useUserProfile } from '../../dashboard/model/queries/useUserProfile';
import { useWallet } from '../../dashboard/model/queries/useWallet';
import WalletButton from '../../dashboard/components/walletButton';
import { useTracks } from '../../ranks/model/queries/useTracks';
import { useUserProfessions } from '../../market/model/queries/useProfessions';
import {
  DifficultyFilter,
  EvidenceModal,
  MissionCelebration,
  MissionItem,
  ProfessionCard,
  RankUpModal,
} from '../components';
import { PROF_CARD_WIDTH } from '../components/professionCard';
import { useAbandonMission, useCompleteMission, useStartMission } from '../model/mutations/useMissionMutations';
import { useJoinLegion } from '../model/mutations/useJoinLegion';
import { useAvailableMissions } from '../model/queries/useAvailableMissions';
import { useMissions } from '../model/queries/useMissions';
import { useLegions } from '../model/queries/useLegions';

type Tab = 'available' | 'inprogress';

const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
const sortByDifficulty = (list: Mission[]) =>
  [...list].sort(
    (a, b) => (DIFFICULTY_ORDER[a.difficulty ?? ''] ?? 99) - (DIFFICULTY_ORDER[b.difficulty ?? ''] ?? 99),
  );

// Tela dedicada às missões de UMA profissão adquirida. Toda a cromática (cabeçalho,
// seletor de tipo, abas e botões) segue a cor principal da profissão (harmonia via
// tints da mesma cor). Acessada apenas a partir da tela de Missões.
export default function ProfessionMissionsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
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

  // Carrossel de profissões (circular): 3 cópias da lista simulam scroll infinito;
  // ao assentar, o card central vira o ativo e reposicionamos silenciosamente na
  // cópia do meio. Tudo imperativo (nada de useEffect reagindo à seleção) p/ não travar.
  const CARD_GAP = 14;
  const CARD_STEP = PROF_CARD_WIDTH + CARD_GAP;
  const N = activeProfessions.length;
  const isCircular = N > 1;
  // Nº ímpar de cópias (mais para listas curtas) — dá folga para flings fortes
  // antes de recentralizar na cópia do meio.
  const COPIES = N <= 2 ? 7 : N <= 4 ? 5 : 3;
  const MIDDLE = Math.floor(COPIES / 2);
  const carouselData = isCircular
    ? Array.from({ length: COPIES }, () => activeProfessions).flat()
    : activeProfessions;
  const carouselRef = useRef<ScrollView>(null);
  const [carouselW, setCarouselW] = useState(0);
  const didInit = useRef(false);
  // Ignora o próximo "settle" quando ele foi causado pela recentralização silenciosa
  // (evita trocar o ativo sozinho durante o scroll).
  const suppressSettle = useRef(false);

  const scrollToDataIndex = (dataIndex: number, animated: boolean) => {
    carouselRef.current?.scrollTo({ x: dataIndex * CARD_STEP, animated });
  };

  // Posiciona uma vez na cópia do meio, no card selecionado (após o layout).
  useEffect(() => {
    if (didInit.current || carouselW === 0 || !isCircular) return;
    const selIdx = Math.max(0, activeProfessions.findIndex((p) => p.id === professionId));
    const id = setTimeout(() => {
      scrollToDataIndex(MIDDLE * N + selIdx, false);
      didInit.current = true;
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselW, isCircular, N]);

  // Ao assentar (fim do snap/inércia): define o card central como ativo e recentraliza
  // na cópia do meio se chegou perto das bordas (efeito infinito, sem emenda).
  const onCarouselSettle = (offsetX: number) => {
    if (!isCircular) return;
    // O settle disparado pela recentralização silenciosa não deve trocar o ativo.
    if (suppressSettle.current) {
      suppressSettle.current = false;
      return;
    }
    const raw = Math.round(offsetX / CARD_STEP);
    const realIdx = ((raw % N) + N) % N;
    const p = activeProfessions[realIdx];
    if (p && p.id !== professionId) setSelectedId(p.id);
    if (raw < N || raw >= (COPIES - 1) * N) {
      suppressSettle.current = true;
      scrollToDataIndex(MIDDLE * N + realIdx, false);
    }
  };

  const theme = professionTheme(profession?.color ?? profession?.specialty_color);

  const profileQuery = useUserProfile(user?.user_id);
  const walletQuery = useWallet(!!user);
  const tracksQuery = useTracks();
  const legionsQuery = useLegions();

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
  const joinLegionM = useJoinLegion(user?.user_id);

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
        {/* ── Barra superior: voltar + rótulo + atalho de compra ──────────── */}
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2 flex-1">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              accessibilityRole="button"
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.soft }}>
              <Text className="text-[18px] font-bold" style={{ color: theme.header }}>‹</Text>
            </TouchableOpacity>
            <Text className="text-[10px] font-bold text-[#b0a0a0] tracking-[2px] uppercase">
              {t('professionMissions.eyebrow')}
            </Text>
          </View>

          {/* Badge dourado → Mercado, para adquirir mais missões de profissão. */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Market')}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={t('professionMissions.buyMore')}
            className="flex-row items-center gap-1.5 rounded-full pl-2.5 pr-3 py-1.5"
            style={{ backgroundColor: '#D4AF37' }}>
            <ShopIcon size={15} color="#6B1221" />
            <Text className="text-[11px] font-extrabold" style={{ color: '#6B1221' }}>
              {t('professionMissions.buyMore')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Seleção de profissão (carrossel quando há mais de uma) ───────── */}
        {activeProfessions.length > 1 && (
          <View className="gap-2.5">
            <Text className="text-[10px] font-bold text-[#b0a0a0] tracking-[2px] uppercase px-0.5">
              {t('professionMissions.switchTitle')}
            </Text>
            <ScrollView
              ref={carouselRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={CARD_STEP}
              snapToAlignment="center"
              onLayout={(e) => setCarouselW(e.nativeEvent.layout.width)}
              onMomentumScrollEnd={(e) => onCarouselSettle(e.nativeEvent.contentOffset.x)}
              contentContainerStyle={{
                paddingTop: 50,
                paddingBottom: 8,
                gap: CARD_GAP,
                paddingHorizontal: carouselW > 0 ? Math.max(4, (carouselW - PROF_CARD_WIDTH) / 2) : 4,
              }}>
              {carouselData.map((p, i) => (
                <CarouselCard
                  key={`${i}-${p.id}`}
                  profession={p}
                  selected={p.id === profession.id}
                  onPress={() => {
                    if (p.id !== profession.id) setSelectedId(p.id);
                    // Sempre centraliza o card escolhido.
                    scrollToDataIndex(i, true);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Card de explicação da profissão (abaixo da seleção) ─────────── */}
        <View className="rounded-[20px] p-4 gap-3" style={{ backgroundColor: theme.header }}>
          <View className="flex-row items-center gap-3">
            <View
              className="w-14 h-14 rounded-[14px] items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
              {profession.icon_url ? (
                <Image
                  source={{ uri: profession.icon_url }}
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />
              ) : (
                <Text className="text-[24px]">🏛️</Text>
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-[20px] font-extrabold text-white"
                numberOfLines={1}
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                {profession.name}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
                {profession.specialty_name ? (
                  <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
                    <Text className="text-[10px] font-bold text-white">{profession.specialty_name}</Text>
                  </View>
                ) : null}
                <Text className="text-[11px] text-white/60">
                  {t('market.professions.missionCount', { n: profession.mission_count })}
                </Text>
              </View>
            </View>
          </View>

          {profession.description ? (
            <Text className="text-[12px] text-white/70 leading-[17px]">{profession.description}</Text>
          ) : null}
        </View>

        {/* ── Seletor de tipo: Diárias | Semanais ─────────────────────────── */}
        <View className="rounded-[16px] p-4 gap-3" style={{ backgroundColor: theme.header }}>
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
            {activeCount != null && (
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: activeCount === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }}>
                <Text className={`text-[11px] font-bold ${activeCount === 0 ? 'text-white/40' : 'text-white'}`}>
                  {activeCount === 0
                    ? t('missions.exhausted')
                    : t('missions.remaining', { count: activeCount })}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row rounded-[10px] p-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <TypeTab
              label={t('missions.daily')}
              active={missionType === 'daily'}
              count={allowance?.daily}
              onPress={() => setMissionType('daily')}
            />
            {!isBelowRecruitIV && (
              <TypeTab
                label={t('missions.weekly')}
                active={missionType === 'monthly'}
                count={allowance?.weekly}
                onPress={() => setMissionType('monthly')}
              />
            )}
          </View>
        </View>

        {/* ── Box: abas de status + conteúdo ──────────────────────────────── */}
        <View className="bg-white border border-[#f0eded] rounded-[20px] overflow-hidden">
          <View className="px-3 pt-3">
            <View className="flex-row bg-[#f4f4f4] rounded-[12px] p-1">
              <StatusTab
                label={t('missionsTabs.available')}
                active={tab === 'available'}
                color={theme.base}
                onPress={() => setTab('available')}
              />
              <StatusTab
                label={t('missionsTabs.inprogress')}
                active={tab === 'inprogress'}
                color={theme.base}
                badge={inProgressMissions.length}
                onPress={() => setTab('inprogress')}
              />
            </View>
          </View>

          <View className="p-3 gap-3">
            {isBelowRecruitIV && (
              <View
                className="rounded-[12px] px-4 py-3 flex-row items-center gap-2"
                style={{ backgroundColor: theme.faint, borderWidth: 1, borderColor: theme.border }}>
                <Text className="text-[14px]">⚔️</Text>
                <Text className="flex-1 text-[12px] leading-[18px]" style={{ color: theme.header }}>
                  {t('professionMissions.belowRecruit')}
                </Text>
              </View>
            )}

            {tab === 'available' ? (
              <>
                {!isBelowRecruitIV && (
                  <DifficultyFilter value={difficultyFilter} onChange={setDifficultyFilter} />
                )}
                {availableLoading ? (
                  <Loading color={theme.base} />
                ) : availableQuery.isError ? (
                  <ErrorBox text={t('missions.errorAvailable')} />
                ) : availableMissions.length === 0 ? (
                  <EmptyBox text={t('professionMissions.emptyAvailable')} emoji="⚔️" />
                ) : (
                  <View className="gap-3">{availableMissions.map(renderItem)}</View>
                )}
              </>
            ) : (
              <>
                {inProgressLoading ? (
                  <Loading color={theme.base} />
                ) : inProgressActiveQuery.isError || pendingReviewQuery.isError ? (
                  <ErrorBox text={t('missions.errorInProgress')} />
                ) : inProgressMissions.length === 0 ? (
                  <EmptyBox text={t('missions.emptyInProgress')} emoji="🛡️" />
                ) : (
                  <View className="gap-3">{inProgressMissions.map(renderItem)}</View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <LegionSelectModal
        visible={legionModalVisible}
        legions={legionsQuery.data ?? []}
        recommendedIds={recommendedIds}
        pending={joinLegionM.isPending}
        onClose={() => setLegionModalVisible(false)}
        onConfirm={(legionId) =>
          joinLegionM.mutate(legionId, { onSuccess: () => setLegionModalVisible(false) })
        }
      />

      <EvidenceModal
        mission={evidenceMission}
        submitting={completeM.isPending}
        onClose={() => setEvidenceMission(null)}
        onSubmit={(evidence) => evidenceMission && submitComplete(evidenceMission, evidence)}
      />

      <MissionCelebration
        visible={celebration != null}
        xp={celebration?.xp ?? 0}
        coins={celebration?.coins}
        onDone={() => setCelebration(null)}
      />

      <RankUpModal
        visible={rankUp != null}
        previousRank={rankUp?.previous}
        previousImage={rankImageByName(rankUp?.previous)}
        newRank={rankUp?.current ?? ''}
        newImage={rankImageByName(rankUp?.current)}
        onClose={() => setRankUp(null)}
      />
    </View>
  );
}

// Card do carrossel com animação de foco: selecionado cresce (escala 1) e fica
// opaco; não selecionado reduz (escala 0.8) e esmaece.
function CarouselCard({
  profession,
  selected,
  onPress,
}: {
  profession: Profession;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(selected ? 1 : 0.8)).current;
  const opacity = useRef(new Animated.Value(selected ? 1 : 0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: selected ? 1 : 0.8, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: selected ? 1 : 0.55, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [selected, scale, opacity]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <ProfessionCard profession={profession} selected={selected} onPress={onPress} />
    </Animated.View>
  );
}

function TypeTab({
  label,
  active,
  count,
  onPress,
}: {
  label: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}) {
  const exhausted = count === 0;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={active ? { backgroundColor: 'rgba(255,255,255,0.9)' } : undefined}
      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px]">
      <Text className={`text-[13px] font-bold ${active ? 'text-[#1c1c1c]' : 'text-white/50'}`}>{label}</Text>
      {count != null && (
        <View
          className="px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: active ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.2)' }}>
          <Text className={`text-[10px] font-bold ${active ? 'text-[#1c1c1c]' : 'text-white'}`}>
            {exhausted ? 0 : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function StatusTab({
  label,
  active,
  color,
  badge,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px] ${active ? 'bg-white' : ''}`}
      style={active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}>
      <Text className="text-[13px] font-bold" style={{ color: active ? color : '#aaa' }}>
        {label}
      </Text>
      {badge != null && badge > 0 && (
        <View className="rounded-full min-w-[18px] px-1 py-0.5 items-center" style={{ backgroundColor: color }}>
          <Text className="text-[10px] font-extrabold text-white leading-none">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function Loading({ color }: { color: string }) {
  return (
    <View className="py-12 items-center">
      <ActivityIndicator color={color} />
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
