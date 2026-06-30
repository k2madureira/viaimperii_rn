import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AssetRarity } from '../../../../api/assets/assetsApi';
import { AureusCoin, CoinAmount, ShopIcon, UnlockedIcon } from '../../../../components/icons';
import { useWallet } from '../../../dashboard/model/queries/useWallet';
import { useAvatarCatalog } from '../../model/queries/useAssetCatalog';
import { useBuyAsset } from '../../model/mutations/useBuyAsset';
import { useEquipAsset } from '../../model/mutations/useEquipAsset';

const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

// Cor de borda por raridade (acento de coleção).
const RARITY_COLOR: Record<AssetRarity, string> = {
  legacy: '#b9b2a6',
  epic: '#5b7fd4',
  mythical: '#9b59b6',
  legendary: '#d4a017',
};
const RARITIES: AssetRarity[] = ['legacy', 'epic', 'mythical', 'legendary'];

type Tab = 'owned' | 'shop';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Grid: 5 colunas; a célula se ajusta à largura do modal.
const GRID_COLS = 5;
const GRID_GAP = 8;

export default function AvatarPickerModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { width: winW } = useWindowDimensions();
  const cell = Math.max(38, Math.floor((winW - 96 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS));
  const [tab, setTab] = useState<Tab>('owned');
  const [rarity, setRarity] = useState<AssetRarity | null>(null);
  const [index, setIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const walletQuery = useWallet(visible);
  // Filtro no servidor: a aba define `owned`, e a raridade vai como query param.
  const catalogQuery = useAvatarCatalog(tab === 'owned', rarity, visible);
  const buyM = useBuyAsset();
  const equipM = useEquipAsset();
  const pending = buyM.isPending || equipM.isPending;

  const items = catalogQuery.data?.items ?? [];
  const total = items.length;
  const balanceAtomic = walletQuery.data?.balance ?? 0;

  // Reposiciona o carrossel ao abrir/trocar de aba ou filtro (aba "habilitados"
  // começa no avatar ativo, se houver).
  useEffect(() => {
    if (!visible) return;
    const active = items.findIndex((a) => a.is_active);
    setIndex(tab === 'owned' && active >= 0 ? active : 0);
    setConfirming(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, tab, rarity, total]);

  const go = (dir: -1 | 1) => {
    if (pending || total < 2) return;
    setIndex((i) => (i + dir + total) % total);
    setConfirming(false);
  };

  const item = items[index];
  const loading = catalogQuery.isLoading;
  const border = item ? (RARITY_COLOR[item.rarity] ?? RARITY_COLOR.legacy) : RARITY_COLOR.legacy;
  const canBuy = item ? item.is_free || item.affordable !== false : false;

  const confirm = () => {
    if (!item) return;
    if (tab === 'owned') {
      equipM.mutate(item.slug, { onSuccess: () => setConfirming(false) });
    } else {
      buyM.mutate(item.slug, {
        onSuccess: () => {
          setConfirming(false);
          setTab('owned'); // recém-comprado migra para "habilitados"
        },
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6 items-center" style={{ maxHeight: '90%' }}>
          <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase">
            {t('avatarPicker.chooseTitle')}
          </Text>
          {/* Saldo da carteira */}
          <View className="bg-[#6B1221] rounded-full px-3.5 py-1.5 mt-2">
            {walletQuery.data ? (
              <CoinAmount atomic={balanceAtomic} size={15} textColor="#E8C36B" />
            ) : (
              <Text className="text-[12px] font-extrabold text-accent-500">—</Text>
            )}
          </View>

          {/* Abas: habilitados / loja */}
          <View className="flex-row w-full bg-[#f0eded] rounded-[12px] p-1 mt-4">
            <TabButton
              label={t('avatarPicker.tabOwned')}
              icon={<UnlockedIcon size={16} color={tab === 'owned' ? '#9E1B32' : '#999'} />}
              active={tab === 'owned'}
              onPress={() => setTab('owned')}
            />
            <TabButton
              label={t('avatarPicker.tabShop')}
              icon={<ShopIcon size={16} color={tab === 'shop' ? '#9E1B32' : '#999'} />}
              active={tab === 'shop'}
              onPress={() => setTab('shop')}
            />
          </View>

          {/* Filtro por raridade */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="w-full mt-3"
            contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            <RarityChip label={t('avatarPicker.rarityAll')} active={rarity == null} onPress={() => setRarity(null)} />
            {RARITIES.map((r) => (
              <RarityChip
                key={r}
                label={t(`avatarPicker.rarity.${r}`)}
                color={RARITY_COLOR[r]}
                active={rarity === r}
                onPress={() => setRarity(r)}
              />
            ))}
          </ScrollView>

          {loading ? (
            <View className="h-44 items-center justify-center">
              <ActivityIndicator color="#9E1B32" />
            </View>
          ) : !item ? (
            <Text className="text-[13px] text-[#888] text-center my-10 px-4">
              {tab === 'owned' ? t('avatarPicker.emptyOwned') : t('avatarPicker.emptyShop')}
            </Text>
          ) : (
            <>
              {/* Carrossel: setas + imagem central */}
              <View className="flex-row items-center justify-between w-full mt-4">
                <TouchableOpacity
                  onPress={() => go(-1)}
                  disabled={total < 2 || pending}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
                  <Text className="text-[22px] text-primary-500 leading-none">‹</Text>
                </TouchableOpacity>

                <View className="flex-1 items-center px-2">
                  <View
                    className="w-28 h-28 rounded-full bg-[#faf7f7] items-center justify-center overflow-hidden"
                    style={{ borderWidth: 3, borderColor: item.is_active ? '#9E1B32' : border }}>
                    <AvatarImage uri={item.url} size={104} fontSize={40} />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => go(1)}
                  disabled={total < 2 || pending}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className={`w-10 h-10 rounded-full items-center justify-center bg-[#f4eaea] ${total < 2 ? 'opacity-30' : ''}`}>
                  <Text className="text-[22px] text-primary-500 leading-none">›</Text>
                </TouchableOpacity>
              </View>

              {/* Nome + badge de estado/preço */}
              <Text
                className="text-[20px] font-extrabold text-[#111] text-center mt-4"
                style={{ fontFamily: serif }}>
                {item.name}
              </Text>
              {tab === 'owned' ? (
                item.is_active ? (
                  <View className="bg-primary-500/10 rounded-full px-2.5 py-0.5 mt-1.5">
                    <Text className="text-[11px] font-bold text-primary-500">{t('avatarPicker.active')}</Text>
                  </View>
                ) : (
                  <View className="bg-[#f0eded] rounded-full px-2.5 py-0.5 mt-1.5">
                    <Text className="text-[11px] font-bold text-[#888]">{t('avatarPicker.owned')}</Text>
                  </View>
                )
              ) : (
                <View className="bg-accent-500/20 rounded-full px-3 py-1 mt-1.5">
                  {item.is_free ? (
                    <Text className="text-[11px] font-bold text-[#9a7b1f]">{t('avatarPicker.free')}</Text>
                  ) : (
                    <CoinAmount atomic={item.price} size={14} textColor="#9a7b1f" />
                  )}
                </View>
              )}

              {/* Matriz de avatares: virtualizada (só renderiza o visível, evita
                  baixar 100+ imagens de uma vez), rola internamente — preview e
                  botão ficam fixos. Clicar seleciona; setas também navegam. */}
              {total > 1 && (
                <FlatList
                  data={items}
                  keyExtractor={(a) => String(a.id)}
                  numColumns={GRID_COLS}
                  extraData={index}
                  style={{ maxHeight: 150, width: '100%' }}
                  className="mt-4"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  initialNumToRender={15}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  removeClippedSubviews
                  columnWrapperStyle={{ gap: GRID_GAP, marginBottom: GRID_GAP }}
                  renderItem={({ item: a, index: i }) => {
                    const selected = i === index;
                    const c = RARITY_COLOR[a.rarity] ?? RARITY_COLOR.legacy;
                    return (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          setIndex(i);
                          setConfirming(false);
                        }}
                        className="rounded-full overflow-hidden items-center justify-center bg-[#f4f1f1]"
                        style={{
                          width: cell,
                          height: cell,
                          borderWidth: selected ? 2.5 : 1.5,
                          borderColor: selected ? '#9E1B32' : c,
                        }}>
                        <AvatarImage uri={a.thumb_url ?? a.url} size={cell} fontSize={Math.round(cell * 0.42)} />
                        {a.is_active && (
                          <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary-500 border border-white" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}

              {/* Botão primário: Equipar / Comprar (ou estado equipado) */}
              <TouchableOpacity
                onPress={() => setConfirming(true)}
                disabled={pending || (tab === 'owned' && item.is_active) || (tab === 'shop' && !canBuy)}
                activeOpacity={0.9}
                className={`w-full rounded-[12px] py-3.5 items-center mt-6 ${
                  (tab === 'owned' && item.is_active) || (tab === 'shop' && !canBuy)
                    ? 'bg-[#cdc5c5]'
                    : 'bg-primary-500'
                }`}>
                <Text className="text-[15px] font-bold text-white">
                  {tab === 'owned'
                    ? item.is_active
                      ? t('avatarPicker.equipped')
                      : t('avatarPicker.equipCta')
                    : canBuy
                      ? t('avatarPicker.buyCta')
                      : t('avatarPicker.cannotAfford')}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity activeOpacity={0.7} onPress={onClose} className="mt-3">
            <Text className="text-[12px] text-[#aaa] text-center">{t('common.back')}</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmação temática (igual ao modal de legião) */}
        {confirming && item && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center px-8">
            <View className="w-full bg-white rounded-[18px] p-6">
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-primary-500/10 items-center justify-center mb-3">
                  {tab === 'owned' ? <UnlockedIcon size={24} color="#9E1B32" /> : <AureusCoin size={26} />}
                </View>
                <Text
                  className="text-[18px] font-extrabold text-[#111] text-center"
                  style={{ fontFamily: serif }}>
                  {tab === 'owned'
                    ? t('avatarPicker.confirmEquipTitle')
                    : t('avatarPicker.confirmBuyTitle')}
                </Text>
              </View>

              <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
                {tab === 'owned'
                  ? t('avatarPicker.confirmEquipQuestion', { name: item.name })
                  : t('avatarPicker.confirmBuyQuestion', { name: item.name, price: item.price_display })}
              </Text>

              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  onPress={() => setConfirming(false)}
                  disabled={pending}
                  activeOpacity={0.85}
                  className="flex-1 border border-[#e0dada] rounded-[12px] py-3 items-center">
                  <Text className="text-[14px] font-bold text-[#666]">{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirm}
                  disabled={pending}
                  activeOpacity={0.9}
                  className="flex-1 bg-primary-500 rounded-[12px] py-3 items-center">
                  {pending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-[14px] font-bold text-white">{t('common.confirm')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

// Imagem de avatar com placeholder (spinner) e fallback em caso de erro.
// Reseta o estado quando a URL muda (a FlatList reaproveita as células).
function AvatarImage({ uri, size, fontSize }: { uri: string | null; size: number; fontSize: number }) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>(uri ? 'loading' : 'error');

  useEffect(() => {
    setStatus(uri ? 'loading' : 'error');
  }, [uri]);

  if (!uri || status === 'error') {
    return <Text style={{ fontSize }}>🎭</Text>;
  }

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="cover"
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
      />
      {status === 'loading' && (
        <View className="absolute inset-0 items-center justify-center bg-[#efeaea]">
          <ActivityIndicator size="small" color="#c9a14a" />
        </View>
      )}
    </View>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[9px] ${active ? 'bg-white' : ''}`}>
      {icon}
      <Text className={`text-[13px] font-bold ${active ? 'text-primary-500' : 'text-[#888]'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

function RarityChip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`flex-row items-center px-3 py-1.5 rounded-full border ${
        active ? 'bg-primary-500 border-primary-500' : 'bg-white border-[#e0dada]'
      }`}>
      {color && (
        <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: active ? '#fff' : color }} />
      )}
      <Text className={`text-[12px] font-bold ${active ? 'text-white' : 'text-[#777]'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
