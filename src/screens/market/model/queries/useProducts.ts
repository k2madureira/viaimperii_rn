import { useQuery } from '@tanstack/react-query';
import { getProducts, ProductType } from '../../../../api/physical/physicalApi';

// Catálogo de produtos filtrado NO SERVIDOR por tipo. Filtrar no servidor mantém
// a paginação consistente quando o catálogo crescer.
export function useProducts(type: ProductType | null, enabled = true) {
  return useQuery({
    queryKey: ['physical-products', type ?? 'all'],
    queryFn: () => getProducts({ type: type ?? undefined, perPage: 100 }),
    enabled,
  });
}
