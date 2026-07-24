import React from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { LeaderCandidate, LegionLeader } from '../../../../../api/legionTreasury';

interface Props {
  visible: boolean;
  leader: LegionLeader | null;
  color: string;
  onClose: () => void;
}

// "Por que ele é o Centurião?" — padrão `LegionSelectModal` (§0.1): card central
// sobre `bg-black/60`, fecha no toque fora.
//
// Mostra a regra (texto pronto do backend), a janela de atividade e o ranking
// que produziu a escolha. O ranking é o gancho de aspiração: dá para medir a
// distância até o topo em XP.
export default function CenturionModal({ visible, leader, color, onClose }: Props) {
  const { t } = useTranslation();

  if (!leader) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/60 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-full bg-white rounded-[20px] p-6">
          <Text className="text-[11px] font-bold text-[#999] tracking-[2px] uppercase text-center">
            {t('legions.treasury.centurion')}
          </Text>

          <Text
            className="text-[20px] font-extrabold text-[#111] text-center mt-1.5"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
            {leader.user.name}
          </Text>

          {/* Regra — o backend já manda o texto pronto em PT-BR. */}
          <View className="bg-[#faf7f7] rounded-[12px] px-3.5 py-3 mt-4">
            <Text className="text-[12px] text-[#555] leading-[18px]">
              {leader.rule_description}
            </Text>
          </View>

          <Text className="text-[11px] text-[#999] text-center mt-2.5">
            {t('legions.treasury.activeMembers', {
              count: leader.active_members,
              days: leader.active_days,
            })}
          </Text>

          {/* Ranking do critério */}
          {leader.candidates.length > 0 && (
            <>
              <Text className="text-[11px] font-bold text-[#999] tracking-[1.5px] uppercase mt-5 mb-1">
                {t('legions.treasury.ranking')}
              </Text>
              {/* Sem isto o leitor assume que a ordem segue o XP total. */}
              <Text className="text-[10.5px] text-[#aaa] leading-[14px] mb-2">
                {t('legions.treasury.criterionNote', { days: leader.active_days })}
              </Text>

              <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                <View className="gap-2">
                  {leader.candidates.map((c, i) => (
                    <CandidateRow key={c.user.id} candidate={c} position={i + 1} color={color} />
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          <Pressable
            onPress={onClose}
            className="w-full bg-primary-500 rounded-[12px] py-3.5 items-center mt-5">
            <Text className="text-[15px] font-bold text-white">{t('common.close')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CandidateRow({
  candidate,
  position,
  color,
}: {
  candidate: LeaderCandidate;
  position: number;
  color: string;
}) {
  const { t } = useTranslation();

  return (
    <View
      className={`flex-row items-center gap-3 rounded-[10px] px-3 py-2.5 ${
        candidate.is_leader ? '' : 'bg-[#faf7f7]'
      }`}
      style={candidate.is_leader ? { backgroundColor: `${color}14` } : undefined}>
      <Text className="text-[12px] font-extrabold text-[#bbb] w-4">{position}</Text>

      <View className="flex-1">
        <Text className="text-[12.5px] font-bold text-[#333]" numberOfLines={1}>
          {candidate.user.name}
        </Text>
        {/* `total_xp` é só o DESEMPATE — vai como contexto, nunca em destaque:
            a lista é ordenada por `recent_xp`, então dar destaque ao vitalício
            faria o ranking parecer fora de ordem. */}
        <Text className="text-[10.5px] text-[#999] mt-0.5">
          {t('legions.treasury.totalXp', { xp: candidate.total_xp.toLocaleString() })}
        </Text>
      </View>

      {/* O critério: XP ganho DENTRO da janela de atividade. */}
      <Text className="text-[12.5px] font-extrabold" style={{ color: '#555' }}>
        {candidate.recent_xp.toLocaleString()} XP
      </Text>
    </View>
  );
}
