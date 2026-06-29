import { useQuery } from '@tanstack/react-query';
import { AssetRarity, getAssetCatalog } from '../../../../api/assets/assetsApi';

// Catálogo de avatares filtrado NO SERVIDOR por posse (aba) e raridade.
// Filtrar no servidor é essencial: há >100 avatares e a paginação cortaria as
// raridades mais caras se filtrássemos só no cliente sobre uma única página.
export function useAvatarCatalog(
  owned: boolean,
  rarity: AssetRarity | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ['asset-catalog', 'avatar', owned, rarity ?? 'all'],
    queryFn: () =>
      getAssetCatalog({ type: 'avatar', owned, rarity: rarity ?? undefined, perPage: 100 }),
    enabled,
  });
}
