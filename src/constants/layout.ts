/**
 * Largura máxima da coluna de conteúdo das telas.
 *
 * Os layouts do app são desenhados para largura de celular (~360–430px). Sem um
 * teto, em telas grandes — iPad (768px em retrato), dobrável aberto, split-screen
 * — os cards esticam e as linhas de texto ficam longas demais para ler.
 * O valor mantém as medidas de celular e centraliza a coluna; em celular
 * (sempre < 600px) não tem efeito algum.
 */
export const CONTENT_MAX_WIDTH = 600;
