import React, { useState } from 'react';
import ScreenContainer from '../../components/screenContainer';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { ProductType } from '../../api/physical';
import { Profession } from '../../api/professions';
import { useUserProfile } from '../dashboard/model/queries/useUserProfile';
import { useWallet } from '../dashboard/model/queries/useWallet';
import { WalletButton } from '../dashboard/components';
import { useProducts } from './model/queries/useProducts';
import { useProfessions, useUserProfessions } from './model/queries/useProfessions';
import { useBuyProfession } from './model/mutations/useBuyProfession';
import { BuyConfirmModal } from './components';
import { MarketSection } from './components/icons';
import {
  CampaignsSection,
  MarketHeader,
  ProductsSection,
  ProfessionsSection,
  SectionSelector,
} from './components/sections';

// Mercado — troca de moedas por missões de profissão, produtos físicos e (em breve) campanhas.
export default function MarketScreen() {
  const insets = useSafeAreaInsets();
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
    <ScreenContainer>
      <Navbar
        rightExtra={walletQuery.data ? <WalletButton balance={walletQuery.data.balance} /> : null}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9E1B32" />
        }>
        <MarketHeader />

        <SectionSelector value={section} onChange={setSection} />

        {section === 'professions' && (
          <ProfessionsSection
            professions={professions}
            ownedIds={ownedIds}
            balance={balance}
            hasTrack={hasTrack}
            isLoading={professionsQuery.isLoading}
            isError={professionsQuery.isError}
            onRetry={() => professionsQuery.refetch()}
            buyingId={buyingId}
            onBuy={setConfirmProf}
            specialtyId={specialtyId}
            onChangeSpecialty={setSpecialtyId}
          />
        )}

        {section === 'products' && (
          <ProductsSection
            products={products}
            type={type}
            onChangeType={setType}
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
            onRetry={() => productsQuery.refetch()}
          />
        )}

        {section === 'campaigns' && <CampaignsSection />}
      </ScrollView>

      {/* Modal padrão de confirmação de compra de profissão */}
      <BuyConfirmModal
        profession={confirmProf}
        balance={balance}
        buying={buyProfM.isPending}
        onConfirm={() =>
          confirmProf && buyProfM.mutate(confirmProf.id, { onSuccess: () => setConfirmProf(null) })
        }
        onClose={() => setConfirmProf(null)}
      />
    </ScreenContainer>
  );
}
