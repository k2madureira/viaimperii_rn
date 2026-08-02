// Espelha os limites do backend (src/application/modules/chat/shared/constants.py).
// Mantidos aqui só para o front validar antes de enviar (o backend é a fonte de verdade).
export const CHAT_BODY_MAX = 2000; // tamanho máximo da mensagem
export const CHAT_DM_MSG_PER_MINUTE = 20; // rate limit por conversa
export const CHAT_DM_MSG_PER_DAY = 500; // teto diário por usuário (fuso SP)
export const CHAT_PAGE_SIZE = 30; // página do histórico/inbox

// Emojis do seletor do composer (grade de 8 colunas). Conteúdo da mensagem — não é
// ícone de UI (a regra "sem emoji em UI" vale para chrome, não para o que o usuário digita).
export const CHAT_EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎',
  '🤩', '🥳', '😉', '🙂', '😇', '🤔', '😴', '😅',
  '😢', '😭', '😡', '😱', '😬', '🥲', '😤', '🙄',
  '👍', '👎', '👏', '🙏', '💪', '🤝', '🙌', '🫡',
  '❤️', '🔥', '🎉', '✨', '💯', '🎯', '⭐', '👀',
  '⚔️', '🛡️', '🏆', '👑', '💰', '🥇', '📜', '🍺',
];
