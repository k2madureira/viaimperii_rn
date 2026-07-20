import React, { useState } from 'react';
import { View } from 'react-native';
import { useLegionLeader } from '../../../model/queries/useLegionLeader';
import CenturionCard from '../../cards/centurionCard';
import CenturionModal from '../../modals/centurionModal';

interface Props {
  legionId: number;
  color: string;
}

// Centurião da legião selecionada na tela de Legiões.
//
// O cofre NÃO vive mais aqui — foi para o Quartel General, onde as ações
// (tributo, proposta, voto) fazem sentido junto da carteira. Nesta tela fica
// apenas quem lidera cada legião.
//
// `GET /legions/{id}/leader` não exige ser membro, então isso funciona para
// qualquer legião do carrossel, não só a do viewer.
export default function LegionCenturionSection({ legionId, color }: Props) {
  const [open, setOpen] = useState(false);

  const leaderQuery = useLegionLeader(legionId);
  const leader = leaderQuery.data?.leader ?? null;

  // Silencioso enquanto carrega ou sem líder elegível (`source: 'none'`): é um
  // bloco acessório do card, não vale um esqueleto nem um estado de erro.
  if (!leader || leader.source === 'none') return null;

  return (
    <View>
      <CenturionCard leader={leader} color={color} onPress={() => setOpen(true)} />

      <CenturionModal
        visible={open}
        leader={leader}
        color={color}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}
