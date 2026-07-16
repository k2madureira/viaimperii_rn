import React, { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Profession } from '../../../../../api/professions/professionsApi';
import { LockIcon } from '../../../../../components/icons';
import SpecialtyFilter, { SpecialtyOption } from '../../filters/specialtyFilter';
import ProfessionCard from '../../cards/professionCard';
import SectionBody from '../../feedback/sectionBody';

interface Props {
  professions: Profession[];
  ownedIds: Set<number>;
  balance: number;
  hasTrack: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  buyingId: number | null;
  onBuy: (profession: Profession) => void;
  specialtyId: number | null;
  onChangeSpecialty: (specialtyId: number | null) => void;
}

// Seção de missões de profissão: aviso de trilha + filtro por especialidade + cards.
export default function ProfessionsSection({
  professions,
  ownedIds,
  balance,
  hasTrack,
  isLoading,
  isError,
  onRetry,
  buyingId,
  onBuy,
  specialtyId,
  onChangeSpecialty,
}: Props) {
  const { t } = useTranslation();

  // Especialidades disponíveis na trilha do usuário (derivadas das profissões
  // visíveis), com a cor de cada especialidade — alimentam o filtro por chips.
  const specialtyOptions = useMemo<SpecialtyOption[]>(() => {
    const map = new Map<number, SpecialtyOption>();
    for (const p of professions) {
      if (p.specialty_id != null && !map.has(p.specialty_id)) {
        map.set(p.specialty_id, {
          id: p.specialty_id,
          name: p.specialty_name ?? '—',
          color: p.specialty_color ?? '#5B6B7A',
        });
      }
    }
    return Array.from(map.values());
  }, [professions]);

  // Zera o filtro quando a especialidade selecionada não existe mais (troca de trilha).
  useEffect(() => {
    if (specialtyId != null && !specialtyOptions.some((s) => s.id === specialtyId)) {
      onChangeSpecialty(null);
    }
  }, [specialtyOptions, specialtyId, onChangeSpecialty]);

  const shown =
    specialtyId == null ? professions : professions.filter((p) => p.specialty_id === specialtyId);

  return (
    <SectionBody
      isLoading={isLoading}
      isError={isError}
      isEmpty={shown.length === 0}
      errorText={t('market.professions.loadError')}
      emptyText={t('market.professions.empty')}
      onRetry={onRetry}>
      <View className="gap-3">
        {hasTrack ? (
          <Text className="text-[12px] text-[#999] leading-[17px]">
            {t('market.professions.hint')}
          </Text>
        ) : (
          <View className="bg-accent-500/15 border border-accent-500/40 rounded-[12px] px-4 py-3 flex-row items-center gap-2.5">
            <LockIcon size={18} color="#8E7116" />
            <Text className="flex-1 text-[12px] text-[#7a5b00] leading-[17px]">
              {t('market.professions.trackLocked')}
            </Text>
          </View>
        )}

        {/* Filtro por especialidade — segue a trilha do usuário */}
        <SpecialtyFilter options={specialtyOptions} value={specialtyId} onChange={onChangeSpecialty} />

        {shown.map((p) => (
          <ProfessionCard
            key={p.id}
            profession={p}
            owned={ownedIds.has(p.id)}
            balance={balance}
            locked={!hasTrack}
            buying={buyingId === p.id}
            onBuy={() => onBuy(p)}
          />
        ))}
      </View>
    </SectionBody>
  );
}
