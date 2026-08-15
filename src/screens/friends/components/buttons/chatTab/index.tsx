import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/text';

interface Props {
  label: string;
  active: boolean;
  // Cor do contexto (Amigos/Clã/Legião): fundo quando ativa, badge quando inativa.
  activeColor: string;
  // Ícone/elemento à esquerda (SVG ou <Image> da legião). Recebe a cor ativa via
  // render-prop para acompanhar o estado da aba.
  renderIcon?: (color: string) => React.ReactNode;
  badge?: number;
  disabled?: boolean;
  onPress: () => void;
}

// Aba segmentada do chat (Amigos / Clã / Legião): ícone + rótulo + contador de
// não-lidas, com a cor do próprio contexto. Desabilitada quando o usuário não
// pertence ao grupo (clã/legião).
export default function ChatTab({
  label,
  active,
  activeColor,
  renderIcon,
  badge,
  disabled = false,
  onPress,
}: Props) {
  const iconColor = disabled ? '#c4b8b8' : active ? '#fff' : '#888';
  const textColor = disabled ? '#c4b8b8' : active ? '#fff' : '#888';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityState={{ selected: active, disabled }}
      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[12px]"
      style={{ backgroundColor: active ? activeColor : 'transparent' }}>
      {renderIcon ? renderIcon(iconColor) : null}
      <Text className="text-[13px] font-bold" numberOfLines={1} style={{ color: textColor }}>
        {label}
      </Text>
      {badge != null && badge > 0 && !disabled && (
        <View
          className="min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center"
          style={{ backgroundColor: active ? '#fff' : activeColor }}>
          <Text
            className="text-[10px] font-extrabold leading-none"
            style={{ color: active ? activeColor : '#fff' }}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
