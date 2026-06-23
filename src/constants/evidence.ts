/**
 * Configuração da imagem de evidência de conclusão de missão.
 *
 * Essas imagens são TEMPORÁRIAS — servem apenas para o revisor validar a conclusão
 * e depois são descartadas. Por isso priorizamos upload leve (resolução/qualidade
 * menores) mantendo legibilidade suficiente para a revisão.
 */

// Largura máxima em px (mantém proporção; nunca faz upscale de imagens menores).
export const MAX_EVIDENCE_WIDTH = 1024;

// Qualidade do JPEG (0..1). Menor = arquivo menor.
export const EVIDENCE_COMPRESS = 0.5;
