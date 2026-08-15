import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../components/text';
import { MessageItem } from '../../../../../api/chat';
import { CHAT_THEME, ChatContext } from '../../../../../constants/chatTheme';
import { parseSharedPostId, stripShareUrl } from '../../../../../utils/sharedPost';
import SharedPostCard from '../sharedPostCard';

interface Props {
  message: MessageItem;
  // Em salas de grupo (legião/clã), mostra o nome do remetente acima das bolhas
  // dos OUTROS — numa DM (1:1) não é necessário.
  showSender?: boolean;
  // Contexto define as cores da bolha (§paleta por sala).
  context?: ChatContext;
}

// Bolha de uma mensagem: à direita quando é minha, à esquerda quando é do outro.
// A cor segue o contexto (Amigos/Clã/Legião). Se a mensagem carrega um link de
// post (compartilhamento), renderiza um card de preview em vez da URL crua.
export default function MessageBubble({ message, showSender = false, context = 'dm' }: Props) {
  const { t } = useTranslation();
  const mine = message.is_mine;
  const removed = message.status === 'removed';
  const theme = CHAT_THEME[context];

  const sharedId = removed ? null : parseSharedPostId(message.body);
  const residual =
    sharedId && message.body ? stripShareUrl(message.body) : message.body;

  const bubbleStyle = {
    backgroundColor: mine ? theme.accent : theme.accentSoft,
  };
  const textColor = mine ? theme.onAccent : theme.bubbleOtherText;

  return (
    <View className={`max-w-[86%] my-0.5 ${mine ? 'self-end' : 'self-start'}`}>
      {showSender && !mine && message.sender ? (
        <Text
          className="text-[11px] font-bold ml-1 mb-0.5"
          numberOfLines={1}
          style={{ color: theme.accent }}>
          {message.sender.name}
        </Text>
      ) : null}
      {removed ? (
        <View
          className={`px-3 py-2 rounded-[14px] ${mine ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'}`}
          style={bubbleStyle}>
          <Text
            maxFontSizeMultiplier={0}
            className="text-[14px] leading-[19px] italic"
            style={{ color: textColor }}>
            {t('chat.messageRemoved')}
          </Text>
        </View>
      ) : (
        <>
          {residual ? (
            <View
              className={`px-3 py-2 rounded-[14px] ${mine ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'}`}
              style={bubbleStyle}>
              <Text
                maxFontSizeMultiplier={0}
                className="text-[14px] leading-[19px]"
                style={{ color: textColor }}>
                {residual}
              </Text>
            </View>
          ) : null}
          {sharedId ? <SharedPostCard postId={sharedId} /> : null}
        </>
      )}
    </View>
  );
}
