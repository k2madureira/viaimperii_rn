import { Mission } from '../api/missions';
import { MIN_EVIDENCE_TEXT_LENGTH } from './evidenceValidation';

/**
 * Gera um texto de evidência a partir das informações da missão (nome, critério de
 * aceitação, especialidade), garantindo o mínimo de caracteres exigido
 * (`MIN_EVIDENCE_TEXT_LENGTH`). Usado para concluir missões de **conclusão imediata**
 * (fácil) sem fricção quando o `proof_type` aceita texto (`text`/`any`).
 *
 * @param prefix Frase inicial já traduzida (ex.: `Concluí a missão "X".`).
 */
/**
 * Detecta o erro de dedup de evidência (backend retorna 422 quando o mesmo usuário
 * reenvia um print já usado). A mensagem crua vem do backend em inglês; casamos por
 * padrão (mesma abordagem tolerante já usada para o erro de "prova exigida").
 */
export function isDuplicateImageError(message?: string): boolean {
  if (!message) return false;
  return /already submitted|submitted before|new screenshot|já.*(enviad|utilizad|usad)/i.test(message);
}

export function buildAutoCompletionText(mission: Mission, prefix: string): string {
  const info = mission.acceptance_criteria?.trim() || mission.specialty_name?.trim() || '';
  let text = (info ? `${prefix} ${info}` : prefix).trim();

  // Rede de segurança: se ainda faltar para o mínimo, completa com o nome/prefixo.
  const pad = mission.name?.trim() || mission.specialty_name?.trim() || prefix;
  while (text.length < MIN_EVIDENCE_TEXT_LENGTH && pad) {
    text = `${text} ${pad}`.trim();
  }

  return text;
}
