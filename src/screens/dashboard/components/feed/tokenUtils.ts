/**
 * Detecção de token (@menção / #hashtag) no ponto do cursor de um TextInput
 * nativo. Como temos acesso direto ao texto e à posição do cursor, isto é
 * simples e confiável (sem WebView, sem debounce).
 */

export interface ActiveToken {
  type: '@' | '#';
  query: string; // termo digitado após o marcador (sem o @/#)
  start: number; // índice do marcador (@/#) no texto
  end: number; // índice do cursor (fim do token)
}

const WORD = /[\wÀ-ÿ.]/; // letras (com acento), dígitos, _ e ponto

/**
 * Retorna o token ativo se o cursor estiver logo após um `@termo`/`#termo`
 * cujo marcador esteja no início do texto ou precedido por espaço/quebra.
 * `null` caso contrário.
 */
export function activeToken(text: string, cursor: number): ActiveToken | null {
  let i = cursor;
  while (i > 0 && WORD.test(text[i - 1])) i--;
  const marker = text[i - 1];
  if (marker !== '@' && marker !== '#') return null;
  // O marcador precisa estar no início ou logo após um espaço (evita e-mails).
  const before = text[i - 2];
  if (before !== undefined && !/\s/.test(before)) return null;
  return { type: marker, query: text.slice(i, cursor), start: i - 1, end: cursor };
}

/** Substitui o intervalo [start, end) por `insert`. */
export function replaceRange(text: string, start: number, end: number, insert: string): string {
  return text.slice(0, start) + insert + text.slice(end);
}
