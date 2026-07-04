/**
 * Conversão entre o **markdown leve** editado no composer (TextInput nativo) e o
 * **HTML** que o backend armazena/sanitiza e que o `FeedHtml` renderiza.
 *
 * Suporta: **negrito**, _itálico_, ~~riscado~~, listas (`- ` / `1. `),
 * títulos (`# `..`### `). `@menção` e `#hashtag` ficam como texto puro (o
 * FeedHtml os destaca na leitura).
 */
import { parseDocument } from 'htmlparser2';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Aplica os marcadores inline (negrito/itálico/riscado) sobre um trecho já
// escapado. Ordem: negrito (**) antes de itálico (_) para não conflitar.
function inlineToHtml(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/~~([^~\n]+)~~/g, '<s>$1</s>');
  out = out.replace(/_([^_\n]+)_/g, '<em>$1</em>');
  return out;
}

/** Markdown leve → HTML (para enviar ao backend). */
export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  const closeList = () => {
    if (list) {
      html.push(`</${list}>`);
      list = null;
    }
  };

  for (const line of lines) {
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const ordered = /^\s*\d+\.\s+(.*)$/.exec(line);
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);

    if (bullet) {
      if (list !== 'ul') {
        closeList();
        html.push('<ul>');
        list = 'ul';
      }
      html.push(`<li>${inlineToHtml(bullet[1])}</li>`);
    } else if (ordered) {
      if (list !== 'ol') {
        closeList();
        html.push('<ol>');
        list = 'ol';
      }
      html.push(`<li>${inlineToHtml(ordered[1])}</li>`);
    } else if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineToHtml(heading[2])}</h${level}>`);
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      html.push(`<p>${inlineToHtml(line)}</p>`);
    }
  }
  closeList();
  return html.join('');
}

// ── HTML → markdown (para reabrir um post na edição) ──────────────────────────

type AnyNode = {
  type: string;
  name?: string;
  data?: string;
  children?: AnyNode[];
  attribs?: Record<string, string>;
};

function childrenToMd(nodes: AnyNode[] | undefined, ordered = false): string {
  if (!nodes) return '';
  let liIndex = 0;
  return nodes
    .map((n) => nodeToMd(n, ordered, ++liIndex))
    .join('');
}

function nodeToMd(node: AnyNode, orderedParent = false, index = 1): string {
  if (node.type === 'text') return node.data ?? '';
  if (node.type !== 'tag') return '';
  const name = node.name;
  const inner = () => childrenToMd(node.children, name === 'ol');
  switch (name) {
    case 'strong':
    case 'b':
      return `**${inner()}**`;
    case 'em':
    case 'i':
      return `_${inner()}_`;
    case 's':
    case 'strike':
    case 'del':
      return `~~${inner()}~~`;
    case 'u':
      return inner(); // sem markdown para sublinhado — mantém o texto
    case 'br':
      return '\n';
    case 'p':
      return `${inner()}\n`;
    case 'h1':
      return `# ${inner()}\n`;
    case 'h2':
      return `## ${inner()}\n`;
    case 'h3':
      return `### ${inner()}\n`;
    case 'ul':
    case 'ol':
      return inner();
    case 'li':
      return `${orderedParent ? `${index}. ` : '- '}${inner()}\n`;
    case 'a':
      return inner(); // v1: mantém só o texto do link
    default:
      return inner();
  }
}

/** HTML → markdown leve (para popular o TextInput na edição). */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  const doc = parseDocument(html);
  return childrenToMd(doc.children as unknown as AnyNode[])
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
