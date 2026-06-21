import { Platform } from 'react-native';

// Substitua pelos IDs reais da sua conta AdMob (pub-9671557492983120)
// após configurar os anúncios em https://admob.google.com
const TEST_REWARDED_ANDROID = 'ca-app-pub-3940256099942544/5224354917';
const TEST_REWARDED_IOS = 'ca-app-pub-3940256099942544/1712485313';

export const REWARDED_AD_UNIT_ID =
  Platform.OS === 'ios' ? TEST_REWARDED_IOS : TEST_REWARDED_ANDROID;
