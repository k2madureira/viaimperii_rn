import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { getProvinces, Province } from '../../api/provinces/provincesApi';

type Step = 'intro' | 'locating' | 'confirm' | 'manual';

interface Props {
  visible: boolean;
  pending?: boolean; // atualizando a província (mutation)
  onConfirm: (provinceId: number) => void;
  onClose: () => void;
}

export default function ProvinceSetupModal({ visible, pending = false, onConfirm, onClose }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [detected, setDetected] = useState<Province | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Province[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reinicia ao reabrir.
  useEffect(() => {
    if (visible) {
      setStep('intro');
      setDetected(null);
      setSearch('');
      setResults([]);
      setError(null);
    }
  }, [visible]);

  // Busca de províncias (manual), com debounce.
  useEffect(() => {
    if (step !== 'manual') return;
    let active = true;
    setLoadingList(true);
    const t = setTimeout(async () => {
      try {
        const list = await getProvinces(search.trim() || undefined);
        if (active) setResults(list);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoadingList(false);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [step, search]);

  const locate = async () => {
    setStep('locating');
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização negada.');
        setStep('manual');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const geo = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const region = geo[0]?.region || geo[0]?.subregion || geo[0]?.city || '';

      if (!region) {
        setStep('manual');
        return;
      }

      const matches = await getProvinces(region);
      if (matches.length > 0) {
        setDetected(matches[0]);
        setStep('confirm');
      } else {
        setSearch(region);
        setStep('manual');
      }
    } catch {
      setError('Não foi possível obter sua localização.');
      setStep('manual');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full bg-white rounded-[20px] p-6" style={{ maxHeight: '80%' }}>
          {/* Cabeçalho */}
          <View className="items-center">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
              <Text className="text-[22px]">📍</Text>
            </View>
            <Text
              className="text-[18px] font-extrabold text-[#111] text-center"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              Onde fica seu domínio?
            </Text>
          </View>

          {/* Passo: introdução */}
          {step === 'intro' && (
            <View>
              <Text className="text-[13px] text-[#555] leading-[19px] text-center mt-3">
                Precisamos da sua localização para situar você em uma província do Império e mostrar
                a presença das legiões na sua região.
              </Text>
              <TouchableOpacity
                onPress={locate}
                activeOpacity={0.9}
                className="w-full bg-primary rounded-[12px] py-3.5 items-center mt-5">
                <Text className="text-[15px] font-bold text-white">Permitir localização</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStep('manual')}
                activeOpacity={0.85}
                className="w-full py-3 items-center mt-1">
                <Text className="text-[14px] font-bold text-[#888]">Escolher manualmente</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Passo: localizando */}
          {step === 'locating' && (
            <View className="py-8 items-center">
              <ActivityIndicator color="#8B1A2B" />
              <Text className="text-[13px] text-[#888] mt-3">Localizando você no Império…</Text>
            </View>
          )}

          {/* Passo: confirmar província detectada */}
          {step === 'confirm' && detected && (
            <View>
              <Text className="text-[13px] text-[#555] text-center mt-3">
                Detectamos que você está em:
              </Text>
              <View className="bg-primary/10 rounded-[12px] px-4 py-3 mt-2 items-center">
                <Text className="text-[17px] font-extrabold text-primary">
                  {detected.name}
                  {detected.abbreviation ? ` · ${detected.abbreviation}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onConfirm(detected.id)}
                disabled={pending}
                activeOpacity={0.9}
                className="w-full bg-primary rounded-[12px] py-3.5 items-center mt-5">
                {pending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-[15px] font-bold text-white">Confirmar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSearch('');
                  setStep('manual');
                }}
                disabled={pending}
                activeOpacity={0.85}
                className="w-full py-3 items-center mt-1">
                <Text className="text-[14px] font-bold text-[#888]">Escolher outra</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Passo: seleção manual */}
          {step === 'manual' && (
            <View className="mt-3" style={{ flexShrink: 1 }}>
              {error ? (
                <Text className="text-[12px] text-[#c0392b] text-center mb-2">{error}</Text>
              ) : null}
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar província/estado…"
                placeholderTextColor="#aaa"
                className="border border-[#e0dada] rounded-[12px] px-3.5 py-2.5 text-[14px] text-[#111]"
              />

              <View className="mt-2" style={{ minHeight: 120 }}>
                {loadingList ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator color="#8B1A2B" />
                  </View>
                ) : (
                  <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 260 }}>
                    {results.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => onConfirm(p.id)}
                        disabled={pending}
                        activeOpacity={0.8}
                        className="flex-row items-center justify-between py-3 border-b border-[#f4f1f1]">
                        <Text className="text-[14px] text-[#222]">{p.name}</Text>
                        {p.abbreviation ? (
                          <Text className="text-[12px] font-bold text-[#aaa]">{p.abbreviation}</Text>
                        ) : null}
                      </TouchableOpacity>
                    ))}
                    {results.length === 0 && (
                      <Text className="text-[13px] text-[#999] text-center py-6">
                        Nenhuma província encontrada.
                      </Text>
                    )}
                  </ScrollView>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
