import React from 'react';
import { View } from 'react-native';
import { LoginStreak } from '../../../../../api/auth';
import RewardsButton from '../../buttons/rewardsButton';
import StreakButton from '../../buttons/streakButton';
import WalletButton from '../../buttons/walletButton';

interface Props {
  streak: LoginStreak | null;
  walletBalance: number | null;
}

// Cluster de ações da navbar da Home: streak e presentes ficam à ESQUERDA da
// carteira. O sino de notificações mudou para o header (à direita do chat) e o
// UserMenu (engrenagem) é renderizado pela Navbar depois.
export default function HomeNavActions({ streak, walletBalance }: Props) {
  return (
    <View className="flex-row items-center gap-3">
      {streak && streak.current_streak > 0 && <StreakButton streak={streak} />}
      <RewardsButton />
      {walletBalance != null && <WalletButton balance={walletBalance} />}
    </View>
  );
}
