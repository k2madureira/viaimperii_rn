import { useQuery } from '@tanstack/react-query';
import { viaimperiiApi } from '../../../../api';

// Briefing do dia (B2): sugeridas + meta + streak + bônus numa só chamada.
export function useDailyBriefing(suggestions = 3, enabled = true) {
  return useQuery({
    queryKey: ['daily-briefing', suggestions],
    queryFn: () => viaimperiiApi.missions.dailyBriefing(suggestions),
    enabled,
  });
}
