import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

/**
 * Teto da escala de fonte do sistema (Ajustes > Acessibilidade > Tamanho da fonte).
 *
 * A tipografia do app é densa e assenta sobre cards de altura fixa
 * (`h-[132px]`, `minHeight: 170`…). Acima de ~130% o texto começa a ser cortado.
 * Este teto preserva a acessibilidade até 130% sem quebrar o layout — o usuário
 * que escolhe 200% no sistema ainda ganha o aumento, só que limitado.
 */
export const MAX_FONT_SCALE = 1.3;

/**
 * `Text` padrão do app: idêntico ao do React Native, mas com o teto de escala
 * já aplicado. Use este em vez de importar `Text` de 'react-native'.
 *
 * Para permitir escala total num texto específico (ex.: um corpo de leitura sem
 * altura fixa), passe `maxFontSizeMultiplier={0}` — 0 desativa o teto.
 */
export default function Text({
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...rest
}: TextProps) {
  return <RNText maxFontSizeMultiplier={maxFontSizeMultiplier} {...rest} />;
}
