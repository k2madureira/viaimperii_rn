import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';
import { ProductType } from '../../../../api/physical';

// Catálogo de produtos filtrado NO SERVIDOR por tipo. Filtrar no servidor mantém
// a paginação consistente quando o catálogo crescer.
export function useProducts(type: ProductType | null, enabled = true) {
  return useQuery({
    queryKey: ['physical-products', type ?? 'all'],
    queryFn: () => viaimperiiApi.physical.catalog({ type: type ?? undefined, perPage: 100 }),
    enabled,
  });
}
