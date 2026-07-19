import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getDailyRewards } from '../../../../api/rewards/dailyRewardsApi';

// Catálogo de prêmios diários + progresso do dia (SP). Passa o idioma atual para
// localizar name/description (?lang=); o backend normaliza pt/pt-BR e en/en-US.
export function useDailyRewards(enabled = true) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  return useQuery({
    queryKey: ['daily-rewards', lang],
    queryFn: () => getDailyRewards(lang),
    enabled,
  });
}
