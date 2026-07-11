import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { ShopIcon } from '../../components/icons';
import { useAuth } from '../../contexts/AuthContext';
import { ProductType } from '../../api/physical/physicalApi';
import { Profession } from '../../api/professions/professionsApi';
import { LockIcon } from '../../components/icons';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useWallet } from '../dashboard/model/queries/useWallet';
import WalletButton from '../dashboard/components/walletButton';
import { useProducts } from './model/queries/useProducts';
import { useProfessions, useUserProfessions } from './model/queries/useProfessions';
import { useRedeemProduct } from './model/mutations/useRedeemProduct';
import { useBuyProfession } from './model/mutations/useBuyProfession';
import TypeFilter from './components/typeFilter';
import SpecialtyFilter, { SpecialtyOption } from './components/specialtyFilter';
import ProductCard from './components/productCard';
import ProfessionCard from './components/professionCard';
import BuyConfirmModal from './components/buyConfirmModal';
import { MarketSection, MarketSectionIcon, SECTION_COLOR } from './components/icons';

const SECTIONS: MarketSection[] = ['professions', 'products', 'campaigns'];

// Mercado — troca de moedas por missões de profissão, produtos físicos e (em breve) campanhas.
export default function MarketScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [section, setSection] = useState<MarketSection>('professions');
  const [type, setType] = useState<ProductType | null>(null);
  // Filtro por especialidade da seção de missões (profissões).
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  // Profissão aguardando confirmação de compra (abre o modal padrão).
  const [confirmProf, setConfirmProf] = useState<Profession | null>(null);

  const walletQuery = useWallet(!!user);
  const balance = walletQuery.data?.balance ?? 0;

  // Trilha do usuário — define quais profissões aparecem e se ficam bloqueadas.
  const profileQuery = useUserProfile(user?.user_id);
  const userTrack = profileQuery.data?.track ?? null;
  const hasTrack = !!userTrack;

  // Só busca o catálogo da seção ativa (evita requests desnecessários).
  const productsQuery = useProducts(type, !!user && section === 'products');
  const professionsQuery = useProfessions(!!user && section === 'professions');
  const userProfessionsQuery = useUserProfessions(user?.user_id, !!user && section === 'professions');

  const redeemM = useRedeemProduct();
  const buyProfM = useBuyProfession();

  const products = productsQuery.data?.items ?? [];
  const ownedIds = new Set((userProfessionsQuery.data ?? []).map((up) => up.profession.id));

  // Missões (profissões) seguem a trilha do usuário: com trilha, mostra as
  // compartilhadas (track_id nulo) + as da própria trilha; sem trilha, mostra o
  // catálogo inteiro porém BLOQUEADO (exige escolher a trilha antes de comprar).
  const allProfessions = professionsQuery.data ?? [];
  const professions = hasTrack
    ? allProfessions.filter((p) => p.track_id == null || p.track_id === userTrack!.id)
    : allProfessions;

  // Especialidades disponíveis na trilha do usuário (derivadas das profissões
  // visíveis), com a cor de cada especialidade — alimentam o filtro por chips.
  const specialtyOptions = useMemo<SpecialtyOption[]>(() => {
    const map = new Map<number, SpecialtyOption>();
    for (const p of professions) {
      if (p.specialty_id != null && !map.has(p.specialty_id)) {
        map.set(p.specialty_id, {
          id: p.specialty_id,
          name: p.specialty_name ?? '—',
          color: p.specialty_color ?? '#5B6B7A',
        });
      }
    }
    return Array.from(map.values());
  }, [professions]);

  // Zera o filtro quando a especialidade selecionada não existe mais (troca de trilha).
  useEffect(() => {
    if (specialtyId != null && !specialtyOptions.some((s) => s.id === specialtyId)) {
      setSpecialtyId(null);
    }
  }, [specialtyOptions, specialtyId]);

  const shownProfessions =
    specialtyId == null ? professions : professions.filter((p) => p.specialty_id === specialtyId);

  const redeemingSlug = redeemM.isPending ? redeemM.variables?.slug ?? null : null;
  const buyingId = buyProfM.isPending ? buyProfM.variables ?? null : null;

  const refreshing =
    section === 'products'
      ? productsQuery.isFetching
      : section === 'professions'
        ? professionsQuery.isFetching || userProfessionsQuery.isFetching
        : false;

  const onRefresh = () => {
    if (section === 'products') productsQuery.refetch();
    else if (section === 'professions') {
      professionsQuery.refetch();
      userProfessionsQuery.refetch();
    }
  };

  return (
    <View className="flex-1 bg-[#fafafa]" style={{ paddingTop: insets.top }}>
      <Navbar
        rightExtra={walletQuery.data ? <WalletButton balance={walletQuery.data.balance} /> : null}
      />
 
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
        }>
        <View>
          <Text className="text-[22px] font-extrabold text-charcoal">{t('market.title')}</Text>
          <Text className="text-[13px] text-[#888] mt-1 leading-[18px]">{t('market.subtitle')}</Text>
        </View>

        {/* ── Seletor de seção do mercado ─────────────────────────────────── */}
        <View className="flex-row bg-[#efeaea] rounded-[12px] p-1">
          {SECTIONS.map((s) => (
            <SectionTab
              key={s}
              section={s}
              label={t(`market.sections.${s}`)}
              active={section === s}
              onPress={() => setSection(s)}
            />
          ))}
        </View>

        {/* ── Conteúdo da seção ativa ─────────────────────────────────────── */}
        {section === 'professions' && (
          <SectionBody
            isLoading={professionsQuery.isLoading}
            isError={professionsQuery.isError}
            isEmpty={shownProfessions.length === 0}
            errorText={t('market.professions.loadError')}
            emptyText={t('market.professions.empty')}
            onRetry={() => professionsQuery.refetch()}>
            <View className="gap-3">
              {hasTrack ? (
                <Text className="text-[12px] text-[#999] leading-[17px]">
                  {t('market.professions.hint')}
                </Text>
              ) : (
                <View className="bg-accent-500/15 border border-accent-500/40 rounded-[12px] px-4 py-3 flex-row items-center gap-2.5">
                  <LockIcon size={18} color="#8E7116" />
                  <Text className="flex-1 text-[12px] text-[#7a5b00] leading-[17px]">
                    {t('market.professions.trackLocked')}
                  </Text>
                </View>
              )}

              {/* Filtro por especialidade — segue a trilha do usuário */}
              <SpecialtyFilter options={specialtyOptions} value={specialtyId} onChange={setSpecialtyId} />

              {shownProfessions.map((p) => (
                <ProfessionCard
                  key={p.id}
                  profession={p}
                  owned={ownedIds.has(p.id)}
                  balance={balance}
                  locked={!hasTrack}
                  buying={buyingId === p.id}
                  onBuy={() => setConfirmProf(p)}
                />
              ))}
            </View>
          </SectionBody>
        )}

        {section === 'products' && (
          <View className="gap-3">
            <TypeFilter value={type} onChange={setType} />
            <SectionBody
              isLoading={productsQuery.isLoading}
              isError={productsQuery.isError}
              isEmpty={products.length === 0}
              errorText={t('market.loadError')}
              emptyText={t('market.empty')}
              onRetry={() => productsQuery.refetch()}>
              <View className="flex-row flex-wrap justify-between">
                {products.map((item) => (
                  <View key={item.slug} style={{ width: '48%', marginBottom: 12 }}>
                    <ProductCard
                      product={item}
                      redeeming={redeemingSlug === item.slug}
                      onRedeem={() => redeemM.mutate({ slug: item.slug })}
                    />
                  </View>
                ))}
              </View>
            </SectionBody>
          </View>
        )}

        {section === 'campaigns' && (
          <View className="bg-white border border-[#f0eded] rounded-[16px] py-12 items-center px-6">
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: `${SECTION_COLOR.campaigns}14` }}>
              <MarketSectionIcon section="campaigns" size={28} color={SECTION_COLOR.campaigns} />
            </View>
            <Text className="text-[14px] font-bold text-charcoal text-center mt-3">
              {t('market.campaigns.soonTitle')}
            </Text>
            <Text className="text-[12px] text-[#999] text-center mt-1 leading-[17px]">
              {t('market.campaigns.soonBody')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal padrão de confirmação de compra de profissão */}
      <BuyConfirmModal
        profession={confirmProf}
        balance={balance}
        buying={buyProfM.isPending}
        onConfirm={() =>
          confirmProf &&
          buyProfM.mutate(confirmProf.id, { onSuccess: () => setConfirmProf(null) })
        }
        onClose={() => setConfirmProf(null)}
      />
    </View>
  );
}

// Estados de carregamento/erro/vazio compartilhados pelas seções.
function SectionBody({
  isLoading,
  isError,
  isEmpty,
  errorText,
  emptyText,
  onRetry,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorText: string;
  emptyText: string;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <View className="py-16 items-center">
        <ActivityIndicator color="#9E1B32" />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="items-center justify-center px-8 gap-3 py-10">
        <Text className="text-[13px] text-[#888] text-center">{errorText}</Text>
        <TouchableOpacity onPress={onRetry} className="bg-primary-500 rounded-[12px] px-5 py-2.5">
          <Text className="text-[13px] font-bold text-white">{t('profile.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (isEmpty) {
    return (
      <View className="bg-white border border-[#f0eded] rounded-[16px] py-12 items-center px-6">
        <ShopIcon size={36} color="#c9b7b7" />
        <Text className="text-[13px] text-[#999] text-center mt-3">{emptyText}</Text>
      </View>
    );
  }
  return <>{children}</>;
}

function SectionTab({
  section,
  label,
  active,
  onPress,
}: {
  section: MarketSection;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const color = SECTION_COLOR[section];
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px] ${active ? 'bg-white' : ''}`}
      style={active ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } : undefined}>
      {/* Ícone sempre colorido pelo tema da seção — adiciona cor mesmo inativo. */}
      <MarketSectionIcon section={section} size={16} color={active ? color : `${color}99`} />
      <Text
        className="text-[13px] font-bold"
        style={{ color: active ? color : '#888' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
