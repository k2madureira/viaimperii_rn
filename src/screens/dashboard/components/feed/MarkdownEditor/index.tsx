import React, { useRef } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ListIcon, OrderedListIcon } from '../../../../../components/icons';

export interface Selection {
  start: number;
  end: number;
}

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  selection: Selection;
  onSelectionChange: (s: Selection) => void;
  minHeight?: number;
  autoFocus?: boolean;
  placeholder?: string;
}

const ICON_ACTIVE = '#333';

// Botão da toolbar (rótulo de texto B/I/S OU um ícone de lista).
function Btn({
  label,
  icon,
  italic,
  strike,
  onPress,
}: {
  label?: string;
  icon?: React.ReactNode;
  italic?: boolean;
  strike?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="min-w-9 h-9 px-2 rounded-[10px] border border-[#f0eded] bg-[#faf7f7] items-center justify-center">
      {icon ?? (
        <Text
          className={`text-[13px] font-bold text-charcoal ${italic ? 'italic' : ''} ${
            strike ? 'line-through' : ''
          }`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

/**
 * Editor de texto do post: `TextInput` nativo (sem WebView) + toolbar que
 * insere **markdown leve** na seleção. A saída é markdown; o envio converte
 * para HTML (ver `markdown.ts`). `@menção`/`#hashtag` são apenas texto — a
 * detecção/sugestão é feita pelo componente pai a partir de `value`+`selection`.
 */
export default function MarkdownEditor({
  value,
  onChangeText,
  selection,
  onSelectionChange,
  minHeight = 140,
  autoFocus = false,
  placeholder,
}: Props) {
  // Controlar `selection` a cada render quebra a digitação no Android (cursor
  // pula, autocorreção). Só forçamos o cursor quando a seleção pedida diverge da
  // última reportada pelo nativo (ou seja, em ações programáticas: botões e
  // inserção de menção). Durante a digitação normal, o campo fica não-controlado.
  const lastNativeSel = useRef<Selection>({ start: 0, end: 0 });
  const forcedSel =
    selection.start !== lastNativeSel.current.start || selection.end !== lastNativeSel.current.end
      ? selection
      : undefined;
  // Envolve a seleção com um marcador (negrito/itálico/riscado). Sem seleção,
  // insere o par vazio e posiciona o cursor no meio.
  const wrap = (marker: string) => {
    const { start, end } = selection;
    const sel = value.slice(start, end);
    const next = value.slice(0, start) + marker + sel + marker + value.slice(end);
    onChangeText(next);
    const caret = sel ? { start: start + marker.length, end: end + marker.length } : { start: start + marker.length, end: start + marker.length };
    onSelectionChange(caret);
  };

  // Prefixa cada linha tocada pela seleção (listas).
  const linePrefix = (prefix: string) => {
    const { start, end } = selection;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const head = value.slice(0, lineStart);
    const body = value.slice(lineStart, end);
    const tail = value.slice(end);
    const prefixed = body
      .split('\n')
      .map((l) => prefix + l)
      .join('\n');
    onChangeText(head + prefixed + tail);
    const added = prefixed.length - body.length;
    onSelectionChange({ start: start + prefix.length, end: end + added });
  };

  return (
    <View>
      <View className="flex-row items-center gap-1.5 mb-2">
        <Btn label="B" onPress={() => wrap('**')} />
        <Btn label="I" italic onPress={() => wrap('_')} />
        <Btn label="S" strike onPress={() => wrap('~~')} />
        <View className="w-px h-5 bg-[#eee] mx-0.5" />
        <Btn icon={<ListIcon size={18} color={ICON_ACTIVE} strokeWidth={2.2} />} onPress={() => linePrefix('- ')} />
        <Btn icon={<OrderedListIcon size={18} color={ICON_ACTIVE} strokeWidth={2.2} />} onPress={() => linePrefix('1. ')} />
      </View>

      <View className="border border-[#e5e5e5] rounded-[12px] px-3 py-2" style={{ minHeight }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          selection={forcedSel}
          onSelectionChange={(e) => {
            lastNativeSel.current = e.nativeEvent.selection;
            onSelectionChange(e.nativeEvent.selection);
          }}
          multiline
          autoFocus={autoFocus}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          textAlignVertical="top"
          className="text-[15px] text-charcoal p-0"
          style={{ minHeight: minHeight - 16 }}
        />
      </View>
    </View>
  );
}
