import React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';
import { MAX_FONT_SCALE } from '../text';

/**
 * `TextInput` padrão do app: mesmo teto de escala de fonte do `Text`
 * (ver `MAX_FONT_SCALE`). Os campos do app usam padding vertical fixo
 * (`Platform.OS === 'ios' ? 13 : 10`), então sem o teto o texto vaza da caixa
 * nas escalas altas do sistema.
 */
/**
 * Tipo da instância nativa do campo — use em refs (`useRef<TextInputRef>(null)`).
 * Necessário porque este wrapper é um componente de função: diferente do
 * `TextInput` do React Native (classe), ele não serve como tipo.
 */
export type TextInputRef = RNTextInput;

// `ref` é prop normal em componentes de função no React 19, mas não faz parte de
// TextInputProps — declarada aqui para os campos que chamam focus() imperativo.
type Props = TextInputProps & { ref?: React.Ref<RNTextInput> };

export default function TextInput({ maxFontSizeMultiplier = MAX_FONT_SCALE, ...rest }: Props) {
  return <RNTextInput maxFontSizeMultiplier={maxFontSizeMultiplier} {...rest} />;
}
