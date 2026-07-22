import { FeedAuthor } from '../feed';
import { CoinDenom } from '../../utils/coins';

// Erro do domínio do cofre que carrega o status HTTP, para o front distinguir os
// estados de UI (403 não é líder/membro · 409 saldo insuficiente ou estandarte já
// ativo · 422 amount/unit inválidos) em vez de tratar tudo como erro genérico.
export class LegionTreasuryApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'LegionTreasuryApiError';
    this.status = status;
  }
}

// Estandarte disponível no catálogo (loja do cofre). `affordable` é calculado
// pelo backend contra o `available` do cofre (saldo MENOS o reservado por uma
// votação aberta) — não contra o `balance` nem contra o saldo pessoal.
export interface StandardOption {
  slug: string;
  name: string;
  multiplier_pct: number; // +% de XP para todos os membros enquanto ativo
  duration_hours: number;
  price: number; // asses atômicos
  price_display: string;
  affordable: boolean | null;
}

// Estandarte içado no momento (1 por vez por legião).
export interface ActiveStandard {
  slug: string;
  name: string;
  multiplier_pct: number;
  starts_at: string;
  ends_at: string;
  remaining_seconds: number;
}

// Movimentação do cofre. `amount` já vem com sinal na ótica do cofre (+entrada / −saída).
export interface TreasuryTransaction {
  tx_type: string; // earn | spend | transfer | ...
  reference_type: string | null; // legion_donation | legion_standard | ...
  amount: number; // asses atômicos, com sinal
  amount_display: string;
  memo: string | null;
  created_at: string;
}

// ─── Centurião (líder derivado) ────────────────────────────────────────────
// O líder NÃO é eleito: é derivado na leitura como o membro ativo (XP nos
// últimos `active_days`) de maior `total_xp`, empate pelo user_id mais antigo.
// Espelha "patente vem do XP" (§5) — por isso não há endpoint de nomeação.

export interface LeaderCandidate {
  user: FeedAuthor;
  total_xp: number;
  recent_xp: number; // XP ganho DENTRO da janela de atividade (o que o qualificou)
  is_leader: boolean;
}

export interface LegionLeader {
  user: FeedAuthor;
  source: 'appointed' | 'derived' | 'none'; // 'none' = sem membro elegível
  rule: string;
  rule_description: string; // texto pronto em PT-BR — exibir como veio
  active_days: number;
  active_members: number;
  // Mandato (tabela `legion_leadership_terms`, gravada por job de hora em hora).
  // AMBOS vêm null quando não há mandato registrado para este líder — o posto
  // acabou de mudar, ou o job ainda não observou. `null` significa
  // DESCONHECIDO, nunca "zero dias": a história é forward-only, então recém-
  // empossado é estado normal e a UI precisa dizer isso em vez de mostrar 0.
  since: string | null;
  days_in_post: number | null;
  candidates: LeaderCandidate[]; // top 5, na ordem do critério
}

// GET /legions/{id}/leader
export interface LegionLeaderResponse {
  legion_id: number;
  leader: LegionLeader | null;
}

// ─── Votação de estandarte ─────────────────────────────────────────────────

export type ProposalStatus = 'open' | 'approved' | 'rejected' | 'expired';

// O que está sendo comprado. Desde a migration 0074 a votação é genérica: o
// índice de "uma proposta aberta" passou a ser por (legião, kind), então a
// legião pode votar Estandarte e Sala de Guerra ao mesmo tempo — antes uma
// votação de estandarte travava a outra por até 5 dias.
export type ProposalKind = 'standard' | 'war_room';

// Acesso da legião à Sala de Guerra + o que custa comprar/estender AGORA.
// O preço escala pelo efetivo ativo, então não é constante entre legiões.
export interface WarRoomAccess {
  unlocked: boolean;
  expires_at: string | null;
  remaining_seconds: number;
  price: number; // asses atômicos, escalado pelo efetivo
  price_display: string;
  active_members: number; // base do escalonamento — mostrar junto do preço
  duration_days: number;
  affordable: boolean; // vs o `available` do cofre
  can_propose: boolean; // o requisitante pode abrir a votação
}

export interface ProposalVote {
  user: FeedAuthor;
  approve: boolean;
}

export interface StandardProposal {
  id: number;
  legion_id: number;
  // `standard` | `war_room` — a UI da votação muda: a Sala de Guerra não tem
  // multiplicador de XP nem duração em horas, os campos abaixo são do catálogo
  // de estandartes e não descrevem o que se está comprando.
  kind: ProposalKind;
  item_slug: string | null;
  standard_slug: string;
  standard_name: string;
  multiplier_pct: number;
  duration_hours: number;
  price: number; // snapshot atômico — o catálogo pode mudar depois da abertura
  price_display: string;
  status: ProposalStatus;
  proposed_by: FeedAuthor;
  votes_yes: number;
  votes_no: number;
  // Congelados na abertura: um efetivo que cresce no meio da votação NÃO move a
  // trave. Abstenção conta contra (limiar = 60% do efetivo, não dos votos dados).
  votes_required: number;
  eligible_voters: number;
  approval_pct: number;
  expires_at: string;
  remaining_seconds: number;
  my_vote: boolean | null; // null = o requisitante ainda não votou
  resolved_at: string | null;
  resolution_note: string | null; // já vem em PT-BR pronto para exibir
  votes: ProposalVote[];
}

// GET /legions/{id}/treasury
export interface LegionTreasury {
  legion_id: number;
  war_room: WarRoomAccess | null;
  balance: number;
  balance_display: string;
  // Travado por uma votação aberta (reserva sem escrow: nenhuma moeda se move
  // até a aprovação). `available = balance − reserved`.
  reserved: number;
  reserved_display: string;
  available: number;
  available_display: string;
  leader: LegionLeader | null;
  can_propose: boolean; // o requisitante pode abrir uma votação agora
  active_standard: ActiveStandard | null;
  // Legado: só a votação mais ANTIGA. Como a legião pode ter uma aberta por
  // kind (Estandarte + Sala de Guerra), este campo sozinho esconde a outra —
  // ler `open_proposals`. Mantido só por compatibilidade.
  open_proposal: StandardProposal | null;
  // Todas as votações abertas, cada uma marcada com seu `kind`.
  open_proposals: StandardProposal[];
  standards: StandardOption[];
  transactions: TreasuryTransaction[];
}

// GET /legions/{id}/standard-proposals
export interface StandardProposalsResponse {
  legion_id: number;
  items: StandardProposal[];
}

// POST /legions/{id}/treasury/donate
export interface DonateToTreasuryInput {
  legionId: number;
  amount: number; // quantidade na denominação `unit`
  unit: CoinDenom;
}

export interface DonateToTreasuryResult {
  message: string;
  legion_id: number;
  donated: number;
  donated_display: string;
  balance: number; // saldo do cofre após a doação
  balance_display: string;
  your_balance: number; // saldo pessoal do doador após a doação
  your_balance_display: string;
}

// POST /legions/{id}/standard/{slug}
// ⚠️ NÃO compra mais na hora: ABRE uma votação. `standard` só vem preenchido no
// caso raro em que a proposta se resolve na própria abertura (legião de 1 membro
// ativo, em que o SIM do proponente já cruza o limiar). No caso comum vem null.
export interface ProposeStandardInput {
  legionId: number;
  slug: string;
}

export interface ProposeStandardResult {
  message: string;
  proposal: StandardProposal;
  balance: number;
  balance_display: string;
  available: number;
  available_display: string;
  standard: ActiveStandard | null;
}

// POST /legions/{id}/standard-proposals/{proposalId}/vote
export interface VoteProposalInput {
  legionId: number;
  proposalId: number;
  approve: boolean;
}

export interface VoteProposalResult {
  message: string;
  proposal: StandardProposal;
  balance: number;
  balance_display: string;
  // Preenchido quando ESTE voto fechou a conta e o estandarte subiu.
  standard: ActiveStandard | null;
}
