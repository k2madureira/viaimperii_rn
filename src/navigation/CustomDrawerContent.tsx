import { DrawerContentComponentProps } from '@react-navigation/drawer';
import React from 'react';
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import LogoIcon from '../components/LogoIcon';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import {
  CampaignsIcon,
  CloseIcon,
  HomeIcon,
  LegionIcon,
  LogoutIcon,
  MissionsIcon,
  RankingIcon,
} from './icons/MenuIcons';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const ITEMS: {
  route: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  { route: 'Home', label: 'Início', Icon: HomeIcon },
  { route: 'Missions', label: 'Missões', Icon: MissionsIcon },
  { route: 'Campaigns', label: 'Campanhas', Icon: CampaignsIcon },
  { route: 'Ranking', label: 'Ranking', Icon: RankingIcon },
  { route: 'Legion', label: 'Legião', Icon: LegionIcon },
];

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const { anchorY } = useSidebar();
  const activeRoute = props.state.routeNames[props.state.index];

  return (
    // Container transparente preenche todo o drawer; o cartão é ancorado ao
    // título "Ave, user!" (topo = anchorY) e tem 60% de altura.
    <View className="flex-1">
      <View
        className="bg-white rounded-r-[18px] overflow-hidden"
        style={{
          marginTop: anchorY,
          height: SCREEN_HEIGHT * 0.6,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 3, height: 0 },
          elevation: 12,
        }}>
        {/* Header — 100% da largura do cartão, conteúdo centralizado */}
        <View className="w-full bg-primary px-3 py-5 items-center">
          <LogoIcon size={30} color="#fff" />
          <View className="h-2" />
          <Text
            className="text-white text-[12px] font-bold tracking-[2px] text-center"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            VIA IMPERII
          </Text>
          {user && (
            <Text className="text-white/70 text-[10px] mt-1 text-center" numberOfLines={1}>
              {user.name?.trim()}
            </Text>
          )}
        </View>

        {/* Botão de fechar — topo/direito limite do sidebar */}
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 items-center justify-center">
          <CloseIcon size={16} color="#fff" />
        </TouchableOpacity>

        {/* Itens */}
        <View className="flex-1 px-2 pt-2">
          {ITEMS.map(({ route, label, Icon }) => {
            const focused = activeRoute === route;
            return (
              <TouchableOpacity
                key={route}
                activeOpacity={0.7}
                onPress={() => props.navigation.navigate(route)}
                className={`flex-row items-center px-2.5 py-2.5 rounded-[10px] mb-1 ${focused ? 'bg-[#f4eaea]' : ''}`}>
                <Icon size={19} color={focused ? '#8B1A2B' : '#444'} />
                <Text
                  className={`ml-2.5 text-[13px] ${focused ? 'font-bold text-primary' : 'font-medium text-[#333]'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rodapé com logout */}
        <View className="px-2 pb-3 pt-2 border-t border-[#f0f0f0]">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={signOut}
            className="flex-row items-center px-2.5 py-2.5 rounded-[10px]">
            <LogoutIcon size={18} color="#ef4444" />
            <Text className="ml-2.5 text-[13px] font-medium text-red-500">Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
