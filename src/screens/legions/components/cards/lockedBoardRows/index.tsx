import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { CoinAmount } from '../../../../../components/icons';

interface Props {
  totalLegions: number;
  shownRows: number;
  price: number | null; // asses atômicos; null enquanto o cofre não carregou
  activeMembers: number | null; // base do escalonamento do preço
  durationDays: number | null;
  canPropose: boolean;
  // Já existe uma votação de Sala aberta. Sem isto o CTA cairia em
  // "só o Praefectus pode abrir", porque `can_propose` fica false pelos DOIS
  // motivos — falta de permissão e votação em curso — e a mensagem errada
  // faria o membro achar que não tem nada acontecendo.
  voteOpen: boolean;
  proposing: boolean;
  onPropose: () => void;
  color: string;
}

// O que fica ABAIXO das três linhas da prévia: silhuetas + CTA de desbloqueio.
//
// As silhuetas são decoração FABRICADA no cliente, nunca dado real borrado —
// mascarar dado real significaria ter enviado o conteúdo pago ao device, que é
// exatamente o que a censura no servidor evita. Elas existem só para comunicar
// "tem mais aqui", como um artigo cortado no meio.
export default function LockedBoardRows({
  totalLegions,
  shownRows,
  price,
  activeMembers,
  durationDays,
  canPropose,
  voteOpen,
  proposing,
  onPropose,
  color,
}: Props) {
  const { t } = useTranslation();

  const hidden = Math.max(0, totalLegions - shownRows);
  const ghosts = Math.min(3, Math.max(1, hidden));

  return (
    <View className="gap-2">
      <View className="gap-2">
        {Array.from({ length: ghosts }).map((_, i) => (
          <View
            key={i}
            className="flex-row items-center gap-3 rounded-[12px] px-3 py-2.5 bg-[#faf7f7]"
            style={{ opacity: 0.55 - i * 0.15 }}>
            <View className="w-6 h-3 rounded-full bg-[#e0dada]" />
            <View className="w-9 h-9 rounded-full bg-[#e8e4e4]" />
            <View className="flex-1 gap-1.5">
              <View className="bg-[#e8e4e4] rounded-full h-3 w-2/3" />
              <View className="bg-[#eeeaea] rounded-full h-2.5 w-1/2" />
            </View>
            <View className="bg-[#e8e4e4] rounded-full h-3 w-12" />
          </View>
        ))}
      </View>

      <View
        className="rounded-[14px] p-4 gap-2.5 border"
        style={{ backgroundColor: `${color}0d`, borderColor: `${color}33` }}>
        <Text className="text-[13px] font-extrabold text-[#333]">
          {hidden > 0
            ? t('legions.board.lockedTitle', { count: hidden })
            : t('legions.board.lockedTitleGeneric')}
        </Text>

        <Text className="text-[11.5px] text-[#888] leading-[16px]">
          {t('legions.board.lockedBody')}
        </Text>

        {/* Preço escala pelo efetivo ativo — mostrar a base evita a leitura de
            que o valor é arbitrário ou igual para todas as legiões. */}
        {price != null && (
          <View className="flex-row items-center gap-2 flex-wrap">
            <CoinAmount atomic={price} size={13} compact />
            {activeMembers != null && durationDays != null && (
              <Text className="text-[10.5px] text-[#999]">
                {t('legions.board.lockedPriceHint', {
                  days: durationDays,
                  active: activeMembers,
                })}
              </Text>
            )}
          </View>
        )}

        {voteOpen ? (
          // A votação já corre — o que falta é voto, não proposta. O card de
          // voto vive no Quartel General.
          <Text className="text-[11.5px] font-bold" style={{ color }}>
            {t('legions.board.lockedVoteOpen')}
          </Text>
        ) : canPropose ? (
          <TouchableOpacity
            onPress={onPropose}
            disabled={proposing}
            activeOpacity={0.85}
            accessibilityRole="button"
            className={`rounded-[12px] py-2.5 items-center mt-0.5 ${proposing ? 'opacity-60' : ''}`}
            style={{ backgroundColor: color }}>
            <Text className="text-[13px] font-bold text-white">
              {t('legions.board.lockedCta')}
            </Text>
          </TouchableOpacity>
        ) : (
          // Só o Praefectus abre a votação — para os demais, dizer QUEM pode
          // é mais útil que um botão desabilitado sem explicação.
          <Text className="text-[11px] text-[#999] italic">
            {t('legions.board.lockedNeedsLeader')}
          </Text>
        )}
      </View>
    </View>
  );
}
