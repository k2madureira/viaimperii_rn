// Detecta/limpa links de post compartilhados numa mensagem de chat. Casa tanto o
// scheme (viaimperii://post/123) quanto a URL https de share (.../post/123).

export function parseSharedPostId(text?: string | null): number | null {
  if (!text) return null;
  const m = text.match(/\/post\/(\d+)/);
  return m ? Number(m[1]) : null;
}

// Remove o token da URL do post do texto (o link vira um card renderizado à parte).
export function stripShareUrl(text: string): string {
  return text
    .replace(/\S*\/post\/\d+\S*/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

// Texto plano a partir do corpo HTML de um post (para o preview do card).
export function htmlToText(body?: string | null, max = 120): string {
  if (!body) return '';
  const plain = body
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length <= max ? plain : `${plain.slice(0, max).trimEnd()}…`;
}
