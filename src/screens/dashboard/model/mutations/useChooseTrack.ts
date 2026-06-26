import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import i18n from '../../../../i18n';
import { chooseTrack } from '../../../../api/ranks/ranksApi';

export function useChooseTrack(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackSlug: string) => chooseTrack(userId as string, trackSlug),
    onSuccess: (result) => {
      Toast.show({
        type: 'success',
        text1: i18n.t('toasts.chooseTrackSuccessTitle'),
        text2: result.xp_penalty > 0
          ? i18n.t('toasts.chooseTrackPenalty', { xp: result.xp_penalty })
          : i18n.t('toasts.chooseTrackWelcome', { track: result.track }),
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
    onError: (error: Error) => {
      Toast.show({ type: 'error', text1: i18n.t('toasts.chooseTrackError'), text2: error.message });
    },
  });
}
