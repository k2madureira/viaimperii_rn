import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  innerColor?: string;
}

// Chama (streak de login) — duas camadas para dar profundidade.
export default function FireIcon({ size = 22, color = '#F2994A', innerColor = '#FFD27A' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 21c-4.4 0-7-2.7-7-6.8 0-3.2 1.8-5.2 3.4-7.3.9-1.2 1.8-2.4 2.2-3.7.2-.6 1-.7 1.3-.1.5 1 .5 2.3.3 3.4-.2.9.7 1.6 1.4.9.6-.6.8-1.5.6-2.4-.1-.6.6-1 1.1-.6C17.7 6 19 8.7 19 11.5c0 5-2.9 9.5-7 9.5Z"
      />
      <Path
        fill={innerColor}
        d="M12 18c-1.8 0-3-1.3-3-3.2 0-1.6 1-2.6 1.7-3.5.3.7.9 1.2 1.6 1.2.9 0 1.6-.7 1.6-1.6 0-.3 0-.6-.1-.9.9.8 1.2 2 1.2 3.3 0 2.4-1.2 4.7-2.9 4.7Z"
      />
    </Svg>
  );
}
