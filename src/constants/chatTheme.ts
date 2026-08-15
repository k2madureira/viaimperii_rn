// Cor por contexto de chat — diferencia visualmente as três salas usando a paleta
// do app (Imperial Red / Imperial Gold / Laurel Green). Cada contexto tinge as
// bolhas, abas, divisores e botões, mantendo contraste legível com texto branco.
export type ChatContext = 'dm' | 'clan' | 'legion';

export interface ChatTheme {
  accent: string; // cor principal (bolha própria, botões, aba ativa)
  accentSoft: string; // fundo suave (bolha do outro, header do grupo)
  onAccent: string; // texto sobre `accent`
  bubbleOtherText: string; // texto na bolha do outro (sobre accentSoft)
}

export const CHAT_THEME: Record<ChatContext, ChatTheme> = {
  // Amigos / DM — Imperial Red (identidade principal do app).
  dm: { accent: '#9E1B32', accentSoft: '#F5E9EC', onAccent: '#FFFFFF', bubbleOtherText: '#2b2b2b' },
  // Clã — Imperial Gold (escurecido p/ contraste com texto branco).
  clan: { accent: '#8E7116', accentSoft: '#F6EFD9', onAccent: '#FFFFFF', bubbleOtherText: '#3a3320' },
  // Legião — Laurel Green (militar/campo).
  legion: { accent: '#2F7A52', accentSoft: '#E6F0EA', onAccent: '#FFFFFF', bubbleOtherText: '#213a2c' },
};
