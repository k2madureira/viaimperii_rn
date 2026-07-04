// Escada de denominações (espelha DENOMINATIONS do backend). Valores no ledger
// são inteiros na menor unidade atômica (asses); aqui quebramos em moedas.
//   1 aureus   = 100000 asses (= 1000 denarii)  → ouro
//   1 denarius =    100 asses                    → prata
//   1 as       =      1                          → bronze
export type CoinDenom = 'aureus' | 'denarius' | 'as';

export const COIN_LADDER: { name: CoinDenom; weight: number }[] = [
  { name: 'aureus', weight: 100000 },
  { name: 'denarius', weight: 100 },
  { name: 'as', weight: 1 },
];

export interface CoinPart {
  name: CoinDenom;
  count: number;
}

// Quebra um valor atômico em contagens por denominação (maior → menor).
export function splitCoins(atomic: number): CoinPart[] {
  let rest = Math.abs(Math.trunc(atomic ?? 0));
  return COIN_LADDER.map(({ name, weight }) => {
    const count = Math.floor(rest / weight);
    rest %= weight;
    return { name, count };
  });
}

// Partes não-nulas (para exibição). Se tudo zero, devolve "0 as".
export function coinParts(atomic: number): CoinPart[] {
  const parts = splitCoins(atomic).filter((p) => p.count > 0);
  return parts.length > 0 ? parts : [{ name: 'as', count: 0 }];
}
