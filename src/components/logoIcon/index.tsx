import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function LogoIcon({ size = 48, color = '#111' }: Props) {
  return (
    <View style={{ width: size, height: (size * 1000) / 943, alignSelf: 'center' }}>
      <Svg
        width={size}
        height={(size * 1000) / 943}
        viewBox="0 0 943 1000"
        fill="none">
        <Path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.0,2.0 L6.1,108.6 L440.6,551.2 L424.2,625.0 L2.0,215.2 L6.1,327.9 L358.6,678.3 L75.8,998.0 L375.0,998.0 L811.5,541.0 L942.6,518.4 L795.1,350.4 L498.0,336.1 L561.5,409.8 L807.4,448.8 L520.5,731.6 L512.3,506.1 Z M2.0,432.4 L2.0,534.8 L182.4,715.2 L202.9,713.1 L241.8,668.0 L10.2,432.4 Z M432.4,725.4 L438.5,733.6 L438.5,805.3 L434.4,821.7 L348.4,913.9 L258.2,920.1 L256.1,907.8 L418.0,731.6 Z M543.0,920.1 L541.0,934.4 L598.4,998.0 L698.8,998.0 L698.8,991.8 L596.3,879.1 L582.0,879.1 Z"
        />
      </Svg>
    </View>
  );
}
