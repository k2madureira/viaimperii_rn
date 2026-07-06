/**
 * Validação client-side da evidência de conclusão de missão (proof_type != none).
 *
 * O backend é a autoridade final:
 *  - modera NSFW (imagem via Rekognition, texto via OpenAI, link por domínio/TLD)
 *    e valida os campos, retornando 422 com a mensagem em `content.detail`.
 * Estas checagens são apenas a primeira linha — dão feedback imediato e evitam
 * um round-trip (e o upload de uma imagem) quando o link/texto já é obviamente
 * inválido ou impróprio. Nunca substituem a validação do servidor.
 */

// Tamanho mínimo exigido quando a missão pede evidência em texto.
export const MIN_EVIDENCE_TEXT_LENGTH = 20;

// Aceita apenas URLs http(s) com um host contendo ponto (ex.: exemplo.com).
const URL_REGEX = /^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]{2,}$/i;

/** True se o valor for uma URL http(s) bem formada. */
export function isValidUrl(value: string): boolean {
  return URL_REGEX.test(value.trim());
}

// Domínios adultos conhecidos e TLDs adultos — espelham o eixo de link do backend.
// Mantido curto de propósito: o backend cobre o resto.
const BLOCKED_DOMAINS = [
  'pornhub',
  'xvideos',
  'xnxx',
  'redtube',
  'youporn',
  'xhamster',
  'onlyfans',
  'brazzers',
  'chaturbate',
  'rule34',
];
const BLOCKED_TLDS = ['.xxx', '.porn', '.sex', '.adult', '.sexy'];

/** True se a URL apontar para um domínio/TLD adulto óbvio. */
export function isBlockedUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (BLOCKED_TLDS.some((tld) => v.includes(tld))) return true;
  return BLOCKED_DOMAINS.some((d) => v.includes(d));
}

// Termos sexuais/explícitos óbvios (PT + EN). Lista propositalmente enxuta —
// o backend (OpenAI) faz a moderação de contexto; aqui só barramos o gritante.
const EXPLICIT_TERMS = [
  'porn',
  'pornô',
  'porno',
  'pornografia',
  'xxx',
  'nsfw',
  'nudes',
  'nude',
  'nudez',
  'sexo explícito',
  'hentai',
  'blowjob',
  'handjob',
  'cumshot',
  'creampie',
  'masturb',
  'fetiche',
  'fetish',
];

/** True se o texto contiver termo explícito óbvio. */
export function hasExplicitContent(value: string): boolean {
  const v = value.trim().toLowerCase();
  return EXPLICIT_TERMS.some((term) => v.includes(term));
}

export type EvidenceFieldError =
  | 'invalidUrl'
  | 'blockedUrl'
  | 'textTooShort'
  | 'explicitText'
  | null;

/** Valida o campo de link (só quando preenchido). */
export function validateLink(link: string): EvidenceFieldError {
  const v = link.trim();
  if (v.length === 0) return null;
  if (!isValidUrl(v)) return 'invalidUrl';
  if (isBlockedUrl(v)) return 'blockedUrl';
  return null;
}

/** Valida o campo de texto (só quando preenchido). */
export function validateText(text: string): EvidenceFieldError {
  const v = text.trim();
  if (v.length === 0) return null;
  if (v.length < MIN_EVIDENCE_TEXT_LENGTH) return 'textTooShort';
  if (hasExplicitContent(v)) return 'explicitText';
  return null;
}
