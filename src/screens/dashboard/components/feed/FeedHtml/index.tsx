import React from 'react';
import { Linking, TextStyle, View } from 'react-native';
import Text from '../../../../../components/text';
import { parseDocument } from 'htmlparser2';

/**
 * Renderiza o `body` de um post — que agora é **HTML sanitizado** pelo backend
 * (allowlist: b/strong, i/em, u, s, ul/ol/li, p, br, h1-h3, a[href]) — em
 * componentes nativos, sem WebView. Destaca `#hashtags` e `@menções` (texto
 * puro no HTML) e abre links. Parser puro-JS (htmlparser2); a renderização do
 * conteúdo rico é feita no client.
 */

interface Props {
  html: string | null | undefined;
  className?: string; // aplicado a cada bloco de texto (tamanho/cor/leading)
  onPressHashtag?: (tag: string) => void;
  onPressMention?: (name: string) => void;
}

const ACCENT = '#9E1B32';
const INLINE_RE = /(#[\wÀ-ÿ]+|@[\wÀ-ÿ.]+)/g;

// Combina sublinhado + riscado sem um sobrescrever o outro.
function mergeDecoration(current: TextStyle['textDecorationLine'], add: 'underline' | 'line-through') {
  if (current && current !== 'none' && current !== add) return 'underline line-through' as const;
  return add;
}

export default function FeedHtml({ html, className, onPressHashtag, onPressMention }: Props) {
  const blocks = React.useMemo(() => (html ? render(html, { onPressHashtag, onPressMention, className }) : null), [
    html,
    className,
    onPressHashtag,
    onPressMention,
  ]);

  if (!blocks) return null;
  return <View>{blocks}</View>;
}

interface Ctx {
  className?: string;
  onPressHashtag?: (tag: string) => void;
  onPressMention?: (name: string) => void;
}

let keySeq = 0;
const nextKey = () => `n${keySeq++}`;

function render(html: string, ctx: Ctx): React.ReactNode[] {
  keySeq = 0;
  const doc = parseDocument(html);
  const blocks: React.ReactNode[] = [];
  walkBlocks(doc.children, ctx, blocks);
  // Sem tags de bloco (ex.: post antigo em texto puro) → um único parágrafo.
  if (blocks.length === 0) {
    blocks.push(
      <Text key={nextKey()} className={ctx.className}>
        {inlineChildren(doc.children, ctx, {})}
      </Text>,
    );
  }
  return blocks;
}

const HEADING_SIZE: Record<string, number> = { h1: 20, h2: 18, h3: 16 };

function walkBlocks(nodes: any[], ctx: Ctx, out: React.ReactNode[]) {
  for (const node of nodes) {
    if (node.type === 'text') {
      if (node.data && node.data.trim()) {
        out.push(
          <Text key={nextKey()} className={ctx.className}>
            {highlight(node.data, {}, ctx)}
          </Text>,
        );
      }
      continue;
    }
    if (node.type !== 'tag') continue;
    const name = node.name as string;

    if (name === 'p') {
      out.push(
        <Text key={nextKey()} className={ctx.className} style={{ marginBottom: 4 }}>
          {inlineChildren(node.children, ctx, {})}
        </Text>,
      );
    } else if (name === 'h1' || name === 'h2' || name === 'h3') {
      out.push(
        <Text
          key={nextKey()}
          className={ctx.className}
          style={{ fontSize: HEADING_SIZE[name], fontWeight: '800', marginBottom: 4 }}>
          {inlineChildren(node.children, ctx, {})}
        </Text>,
      );
    } else if (name === 'ul' || name === 'ol') {
      const items = (node.children || []).filter((c: any) => c.type === 'tag' && c.name === 'li');
      items.forEach((li: any, i: number) => {
        out.push(
          <View key={nextKey()} style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text className={ctx.className} style={{ marginRight: 6 }}>
              {name === 'ol' ? `${i + 1}.` : '•'}
            </Text>
            <Text className={ctx.className} style={{ flex: 1 }}>
              {inlineChildren(li.children, ctx, {})}
            </Text>
          </View>,
        );
      });
    } else {
      // Tag inline no topo (b/i/u/s/a/br) → embrulha num parágrafo.
      out.push(
        <Text key={nextKey()} className={ctx.className} style={{ marginBottom: 4 }}>
          {inlineChildren([node], ctx, {})}
        </Text>,
      );
    }
  }
}

function inlineChildren(nodes: any[], ctx: Ctx, style: TextStyle): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (const node of nodes || []) {
    if (node.type === 'text') {
      out.push(...highlight(node.data || '', style, ctx));
      continue;
    }
    if (node.type !== 'tag') continue;
    const name = node.name as string;

    if (name === 'br') {
      out.push(<Text key={nextKey()}>{'\n'}</Text>);
    } else if (name === 'b' || name === 'strong') {
      out.push(...inlineChildren(node.children, ctx, { ...style, fontWeight: '700' }));
    } else if (name === 'i' || name === 'em') {
      out.push(...inlineChildren(node.children, ctx, { ...style, fontStyle: 'italic' }));
    } else if (name === 'u') {
      out.push(...inlineChildren(node.children, ctx, { ...style, textDecorationLine: mergeDecoration(style.textDecorationLine, 'underline') }));
    } else if (name === 's') {
      out.push(...inlineChildren(node.children, ctx, { ...style, textDecorationLine: mergeDecoration(style.textDecorationLine, 'line-through') }));
    } else if (name === 'a') {
      const href: string | undefined = node.attribs?.href;
      out.push(
        <Text
          key={nextKey()}
          style={{ ...style, color: ACCENT, textDecorationLine: 'underline' }}
          onPress={href ? () => Linking.openURL(href).catch(() => {}) : undefined}>
          {inlineChildren(node.children, ctx, style)}
        </Text>,
      );
    } else {
      // p/li/heading aninhado inesperado — segue processando o conteúdo.
      out.push(...inlineChildren(node.children, ctx, style));
    }
  }
  return out;
}

// Quebra um texto puro em runs, destacando #hashtag e @menção (clicáveis).
function highlight(text: string, style: TextStyle, ctx: Ctx): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) out.push(<Text key={nextKey()} style={style}>{text.slice(last, m.index)}</Text>);
    const raw = m[0];
    const isTag = raw.startsWith('#');
    out.push(
      <Text
        key={nextKey()}
        style={{ ...style, color: ACCENT, fontWeight: '600' }}
        onPress={
          isTag
            ? ctx.onPressHashtag && (() => ctx.onPressHashtag!(raw.slice(1)))
            : ctx.onPressMention && (() => ctx.onPressMention!(raw.slice(1)))
        }>
        {raw}
      </Text>,
    );
    last = m.index + raw.length;
  }
  if (last < text.length) out.push(<Text key={nextKey()} style={style}>{text.slice(last)}</Text>);
  return out;
}
