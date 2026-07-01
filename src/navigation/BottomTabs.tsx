import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeIcon from './icons/HomeIcon';
import AchievementsIcon from './icons/AchievementsIcon';
import ProfileIcon from './icons/ProfileIcon';
import { PlusIcon, PrimusPilusEmblem } from '../components/icons';
import MissionsScreen from '../screens/missions';
import AchievementsScreen from '../screens/achievements';
import ProfileScreen from '../screens/profile';
import HomeStack from './HomeStack';
import { useAuth } from '../contexts/AuthContext';
import { useAvailableMissions } from '../screens/missions/model/queries/useAvailableMissions';
import { useUserProfile } from '../screens/dashboard/model/queries/useUserProfile';
import { CreatePostModal } from '../screens/dashboard/components/feed';

export type BottomTabParamList = {
  Home: undefined;
  Missions: undefined;
  CreatePost: undefined;
  Achievements: undefined;
  Profile: undefined;
};

export type BottomTabNavProp = BottomTabNavigationProp<BottomTabParamList>;

const Tab = createBottomTabNavigator<BottomTabParamList>();

type IconComponent = (props: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => React.ReactElement;

const TAB_ICON: Partial<Record<keyof BottomTabParamList, IconComponent>> = {
  Home: HomeIcon,
  // Emblema Primus Pilus (mesmo svg do antigo card de missões) — silhueta
  // monocromática para seguir o esquema de cor (cinza inativo / vermelho ativo).
  Missions: ({ size, color }) => <PrimusPilusEmblem size={size} color={color} />,
  Achievements: AchievementsIcon,
  Profile: ProfileIcon,
};

// Aba "CreatePost" não navega — só abre o modal. Precisa de um componente de
// tela válido para o Tab.Navigator, mas ele nunca chega a ser exibido.
function EmptyScreen() {
  return null;
}

export default function BottomTabs() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [createPostVisible, setCreatePostVisible] = useState(false);

  // Badge do ícone de Missões: total de missões disponíveis agora.
  const availableQuery = useAvailableMissions(null, null, !!user);
  const availableCount = availableQuery.data?.totalItems ?? availableQuery.data?.items?.length ?? 0;

  // Legião/província do usuário — filtram os escopos disponíveis no modal de post.
  const profileQuery = useUserProfile(user?.user_id);
  const canLegion = profileQuery.data?.legion != null;
  const canProvince = profileQuery.data?.province != null;

  const TAB_LABEL: Record<keyof BottomTabParamList, string> = {
    Home: t('nav.home'),
    Missions: t('nav.missions'),
    CreatePost: '',
    Achievements: t('nav.achievements'),
    Profile: t('nav.profile'),
  };
  // Eleva a barra acima da área de gestos do sistema (home indicator / nav bar).
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 12);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#9E1B32',
          tabBarInactiveTintColor: '#9aa0a6',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
          tabBarItemStyle: { paddingTop: 4 },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#EAEAEA',
            height: 60 + bottomInset,
            paddingTop: 8,
            paddingBottom: bottomInset,
          },
          tabBarIcon: ({ focused }) => {
            // Botão de criar post: círculo verde de destaque com um (+) branco,
            // sempre com a mesma aparência (não segue o estado focused).
            if (route.name === 'CreatePost') {
              return (
                <View
                  className="w-12 h-12 rounded-[12px] bg-laurel items-center justify-center"
                  style={{
                    marginTop: -8,
                    borderWidth: 3,
                    borderColor: '#fff',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                  }}>
                  <PlusIcon size={26} color="#fff" strokeWidth={2.6} />
                </View>
              );
            }

            const Icon = TAB_ICON[route.name]!;
            const badgeCount = route.name === 'Missions' ? availableCount : 0;
            return (
              <View>
                <Icon
                  size={23}
                  color={focused ? '#9E1B32' : '#9aa0a6'}
                  strokeWidth={focused ? 2.2 : 2}
                />
                {badgeCount > 0 && (
                  <View
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 rounded-full bg-primary-500 items-center justify-center px-1"
                    style={{ borderWidth: 1.5, borderColor: '#fff' }}>
                    <Text className="text-[9px] font-extrabold text-white leading-none">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
          tabBarLabel: TAB_LABEL[route.name],
        })}>
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Missions" component={MissionsScreen} />
        <Tab.Screen
          name="CreatePost"
          component={EmptyScreen}
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              setCreatePostVisible(true);
            },
          })}
        />
        <Tab.Screen name="Achievements" component={AchievementsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <CreatePostModal
        visible={createPostVisible}
        canLegion={canLegion}
        canProvince={canProvince}
        onClose={() => setCreatePostVisible(false)}
      />
    </>
  );
}
