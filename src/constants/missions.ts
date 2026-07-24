import { Mission } from '../api/missions';

// Tamanho de página da lista de missões (quantas aparecem antes do "Buscar mais").
export const PAGE_SIZE = 5;

// Ordenação por dificuldade: fácil → médio → difícil (nulos por último).
export const DIFFICULTY_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

export const sortByDifficulty = (list: Mission[]) =>
  [...list].sort(
    (a, b) =>
      (DIFFICULTY_ORDER[a.difficulty ?? ''] ?? 99) - (DIFFICULTY_ORDER[b.difficulty ?? ''] ?? 99),
  );

// Primeira patente de cada trilha — usada no aviso de "abaixo de Recruta IV".
export const FIRST_TRACK_RANK: Record<string, string> = {
  legionarios: 'Legionary I',
  patricios: 'Discipulus I',
};

// Forma de "brilho" (estrela de 4 pontas) usada nas partículas do hero de profissão.
export const SPARKLE_PATH =
  'M12 0 C13.2 8, 16 10.8, 24 12 C16 13.2, 13.2 16, 12 24 C10.8 16, 8 13.2, 0 12 C8 10.8, 10.8 8, 12 0 Z';

export interface SparkleSpec {
  left: `${number}%`;
  top: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

// Estrelas cintilantes espalhadas pelo card (efeito "brilho"). Decorativo.
export const SPARKLES: SparkleSpec[] = [
  { left: '10%', top: 8, size: 12, color: '#FFFFFF', delay: 0, duration: 2400 },
  { left: '30%', top: 30, size: 8, color: '#F2D98D', delay: 900, duration: 2200 },
  { left: '50%', top: 12, size: 10, color: '#D4AF37', delay: 1700, duration: 2600 },
  { left: '64%', top: 34, size: 7, color: '#FFFFFF', delay: 2400, duration: 2100 },
  { left: '80%', top: 10, size: 11, color: '#D4AF37', delay: 600, duration: 2500 },
  { left: '90%', top: 40, size: 8, color: '#F2D98D', delay: 1900, duration: 2300 },
  { left: '20%', top: 46, size: 9, color: '#D4AF37', delay: 3000, duration: 2200 },
];
