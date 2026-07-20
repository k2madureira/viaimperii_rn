import { apiFetch, readContent, readError } from '../config/defaultApi';
import { LegionTreasuryApiError, VoteProposalInput, VoteProposalResult } from './dto';

// POST /legions/{id}/standard-proposals/{proposalId}/vote — qualquer MEMBRO da
// legião vota (não só os ativos); o voto é mutável enquanto a janela está
// aberta. Quando este voto cruza o limiar, a resposta já traz o `standard`
// hasteado.
//   404 proposta não existe nesta legião · 403 não é membro
//   409 votação encerrada · prazo vencido
export async function voteStandardProposal({
  legionId,
  proposalId,
  approve,
}: VoteProposalInput): Promise<VoteProposalResult> {
  const response = await apiFetch(
    `/legions/${legionId}/standard-proposals/${proposalId}/vote`,
    { method: 'POST', body: JSON.stringify({ approve }) },
  );

  if (!response.ok) {
    throw new LegionTreasuryApiError(
      response.status,
      await readError(response, 'Erro ao registrar o voto'),
    );
  }

  return readContent<VoteProposalResult>(response);
}
