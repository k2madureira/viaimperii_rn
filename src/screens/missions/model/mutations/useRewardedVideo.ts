import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { registerRewardedVideo } from '../../../../api/missions/missionsApi';
import { REWARDED_AD_UNIT_ID } from '../../../../constants/admob';
import Toast from 'react-native-toast-message';

export type AdState = 'idle' | 'loading' | 'ready' | 'showing' | 'error';

export function useRewardedVideo() {
  const queryClient = useQueryClient();
  const adRef = useRef<ReturnType<typeof RewardedAd.createForAdRequest> | null>(null);
  const [adState, setAdState] = useState<AdState>('idle');

  // Carrega o ad e, ao ficar pronto, exibe automaticamente — tudo em um clique.
  const watchAd = useCallback(() => {
    if (adState !== 'idle' && adState !== 'error') return;

    setAdState('loading');
    const ad = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdState('showing');
      ad.show();
    });

    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async () => {
      try {
        await registerRewardedVideo();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['missions-available'] }),
          queryClient.invalidateQueries({ queryKey: ['missions'] }),
        ]);
        Toast.show({
          type: 'success',
          text1: '+2 missões desbloqueadas!',
          text2: 'Suas missões diárias foram renovadas.',
        });
      } catch {
        Toast.show({ type: 'error', text1: 'Erro ao registrar vídeo assistido.' });
      } finally {
        setAdState('idle');
        adRef.current = null;
      }
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdState('idle');
      adRef.current = null;
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setAdState('error');
      adRef.current = null;
      Toast.show({ type: 'error', text1: 'Anúncio indisponível no momento.' });
    });

    adRef.current = ad;
    ad.load();
  }, [adState, queryClient]);

  return { adState, watchAd };
}
