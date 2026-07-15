import { Mission } from '../api/missions/missionsApi';
import { MIN_EVIDENCE_TEXT_LENGTH } from './evidenceValidation';

/**
 * Gera um texto de evidência a partir das informações da missão (nome, critério de
 * aceitação, especialidade), garantindo o mínimo de caracteres exigido
 * (`MIN_EVIDENCE_TEXT_LENGTH`). Usado para concluir missões de **conclusão imediata**
 * (fácil) sem fricção quando o `proof_type` aceita texto (`text`/`any`).
 *
 * @param prefix Frase inicial já traduzida (ex.: `Concluí a missão "X".`).
 */
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
