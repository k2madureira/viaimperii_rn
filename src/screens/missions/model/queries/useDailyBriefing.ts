import { useQuery } from '@tanstack/react-query';
import { getDailyBriefing } from '../../../../api/missions/missionsApi';

// Briefing do dia (B2): sugeridas + meta + streak + bônus numa só chamada.
export function useDailyBriefing(suggestions = 3, enabled = true) {
  return useQuery({
    queryKey: ['daily-briefing', suggestions],
    queryFn: () => getDailyBriefing(suggestions),
    enabled,
  });
}
