import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { viaimperiiApi } from '../../../../api';
import { DailyBriefing, Mission } from '../../../../api/missions';

interface Vars {
  slug: string;
  // Estado ATUAL do favorito — decide o endpoint (favoritar × desfavoritar).
  isFavorite: boolean;
}

// Vira o `is_favorite`/`favorited_at` de uma missão dentro de qualquer cache que
// carregue uma lista de missões (`.items`). Não muda a ordem — a reconciliação
// (ordenar por mais recente) fica com o refetch em onSettled.
function flip(items: Mission[] | undefined, slug: string, next: boolean): Mission[] | undefined {
  if (!items) return items;
  return items.map((m) =>
    m.slug === slug
      ? { ...m, is_favorite: next, favorited_at: next ? new Date().toISOString() : null }
      : m,
  );
}

/**
 * Alterna o favorito de uma missão (§14.favoritos). Optimistic: a estrela responde
 * na hora em todas as listas em cache; onError faz rollback; onSettled invalida a
 * lista de favoritos e o briefing para reconciliar ordem/remoção.
 *
 * NÃO toca em XP/moeda/wallet/stats — favoritar é ortogonal ao ciclo da missão.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, isFavorite }: Vars) =>
      isFavorite
        ? viaimperiiApi.missions.unfavorite(slug)
        : viaimperiiApi.missions.favorite(slug),

    onMutate: async ({ slug, isFavorite }: Vars) => {
      const next = !isFavorite;
      // Chaves cujo cache carrega `PaginatedMissions`/`RecommendedMissions` (têm `.items`).
      const listKeys = [['missions'], ['missions-available'], ['missions-recommended']];
      await Promise.all([
        ...listKeys.map((k) => queryClient.cancelQueries({ queryKey: k })),
        queryClient.cancelQueries({ queryKey: ['missions-favorites'] }),
        queryClient.cancelQueries({ queryKey: ['daily-briefing'] }),
      ]);

      const snapshot = {
        lists: listKeys.map((k) => queryClient.getQueriesData<{ items?: Mission[] }>({ queryKey: k })),
        favorites: queryClient.getQueriesData<{ items?: Mission[] }>({ queryKey: ['missions-favorites'] }),
        briefing: queryClient.getQueriesData<DailyBriefing>({ queryKey: ['daily-briefing'] }),
      };

      for (const k of listKeys) {
        queryClient.setQueriesData<{ items?: Mission[] }>({ queryKey: k }, (old) =>
          old?.items ? { ...old, items: flip(old.items, slug, next) } : old,
        );
      }

      // Lista de favoritos: desfavoritar remove o item na hora (some da "rotina do dia").
      queryClient.setQueriesData<{ items?: Mission[] }>({ queryKey: ['missions-favorites'] }, (old) => {
        if (!old?.items) return old;
        return { ...old, items: next ? flip(old.items, slug, next) : old.items.filter((m) => m.slug !== slug) };
      });

      // Briefing: vira a estrela nas sugeridas e remove/vira nas favoritas.
      queryClient.setQueriesData<DailyBriefing>({ queryKey: ['daily-briefing'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          suggested_missions: (flip(old.suggested_missions, slug, next) as DailyBriefing['suggested_missions']) ?? old.suggested_missions,
          favorite_missions: next
            ? old.favorite_missions
            : old.favorite_missions.filter((m) => m.slug !== slug),
        };
      });

      return snapshot;
    },

    onError: (_err, _vars, context) => {
      if (!context) return;
      for (const group of context.lists) {
        for (const [key, data] of group) queryClient.setQueryData(key, data);
      }
      for (const [key, data] of context.favorites) queryClient.setQueryData(key, data);
      for (const [key, data] of context.briefing) queryClient.setQueryData(key, data);
      Toast.show({ type: 'error', text1: i18n.t('toasts.favoriteError') });
    },

    onSettled: () => {
      // Reconciliação: só a lista de favoritos (ordem/remoção) e o briefing precisam
      // de refetch; as demais listas já refletem o flip otimista.
      queryClient.invalidateQueries({ queryKey: ['missions-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['daily-briefing'] });
    },
  });
}
