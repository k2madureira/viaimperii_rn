import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SearchIcon } from '../icons';

interface Props {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
  // Quando presente, a barra vira um botão (não editável) que dispara onPress.
  onPress?: () => void;
}

// Barra de busca global — visual padrão (branco, borda suave, lupa à esquerda).
// Pode operar como campo editável ou como gatilho (onPress) para uma tela de busca.
export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  editable = true,
  autoFocus = false,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const ph = placeholder ?? t('search.placeholder');

  const inner = (
    <View
      className="flex-row items-center bg-white border border-[#f0eded] rounded-[16px] px-4"
      style={{ height: 50 }}>
      <SearchIcon size={20} color="#9aa0a6" />
      {onPress ? (
        <Text className="flex-1 ml-3 text-[15px] text-[#999]" numberOfLines={1}>
          {ph}
        </Text>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
          placeholder={ph}
          placeholderTextColor="#999"
          editable={editable}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          className="flex-1 ml-3 text-[15px] text-charcoal p-0"
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}
