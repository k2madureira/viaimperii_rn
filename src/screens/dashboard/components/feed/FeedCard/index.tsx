import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HomeNavigationProp } from '../../../../../navigation/HomeStack';
import { FeedItem, ReactionType } from '../../../../../api/feed/feedApi';
import { parseBackendDate } from '../../../../../utils/date';
import { CommentIcon, EditIcon, EyeIcon, TrashIcon } from '../../../../../components/icons';
import FeedReactions, { ReactionCluster } from '../FeedReactions';
import AnchoredPopover, { Anchor } from '../AnchoredPopover';
import FeedHtml from '../FeedHtml';
import MediaGallery from '../MediaGallery';
import EditPostModal from '../EditPostModal';
import ReactorsPopover from '../ReactorsPopover';
import { useDeletePost } from '../../../model/mutations/useDeletePost';

interface LegionMini {
  id: number;
  name: string;
}

interface Props {
  item: FeedItem;
  currentUserId?: string | null;
  legions?: LegionMini[];
  onReact: (eventId: number, type: ReactionType, currentMine: ReactionType | null) => void;
  onOpenComments: (item: FeedItem) => void;
}

const EVENT_META: Record<string, { emoji: string; key: string }> = {
  mission_completed: { emoji: '⚔️', key: 'mission_completed' },
  rank_up: { emoji: '🎖️', key: 'rank_up' },
  medal_earned: { emoji: '🏅', key: 'medal_earned' },
  achievement_unlocked: { emoji: '🏆', key: 'achievement_unlocked' },
  legion_joined: { emoji: '🦅', key: 'legion_joined' },
  campaign_completed: { emoji: '📖', key: 'campaign_completed' },
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
 
export default function FeedCard({
  item,
  currentUserId,
  legions,
  onReact,
  onOpenComments,
}: Props) {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<HomeNavigationProp>();
  const { author } = item;
  const avatarUrl = author.active_avatar?.url ?? author.image ?? null;
  const deleteM = useDeletePost();

  // Só usuários reais têm perfil navegável (eventos de sistema não).
  const canViewProfile = item.source === 'user' && !!author.id;
  const goToProfile = () => {
    setUserAnchor(null);
    if (canViewProfile) navigation.navigate('Profile', { userId: author.id });
  };

  const avatarRef = useRef<View>(null);
  const menuRef = useRef<View>(null);
  const reactorsRef = useRef<View>(null);
  const [userAnchor, setUserAnchor] = useState<Anchor | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<Anchor | null>(null);
  const [reactorsAnchor, setReactorsAnchor] = useState<Anchor | null>(null);
  const [editing, setEditing] = useState(false);

  const isOwnPost =
    item.source === 'user' && currentUserId != null && author.id === currentUserId;
  const legionName = author.legion_id
    ? legions?.find((l) => l.id === author.legion_id)?.name ?? null
    : null;

  const openUser = () =>
    avatarRef.current?.measureInWindow((x, y, w, h) =>
      setUserAnchor({ x, y, width: w, height: h }),
    );
  const openMenu = () =>
    menuRef.current?.measureInWindow((x, y, w, h) =>
      setMenuAnchor({ x, y, width: w, height: h }),
    );
  const openReactors = () =>
    reactorsRef.current?.measureInWindow((x, y, w, h) =>
      setReactorsAnchor({ x, y, width: w, height: h }),
    );

  const confirmDelete = () => {
    setMenuAnchor(null);
    Alert.alert(t('feed.deleteConfirmTitle'), t('feed.deleteConfirmBody'), [
      { text: t('evidenceModal.cancel'), style: 'cancel' },
      { text: t('feed.delete'), style: 'destructive', onPress: () => deleteM.mutate(item.id) },
    ]);
  };

  const relativeTime = React.useMemo(() => {
    const d = parseBackendDate(item.created_at);
    if (!d) return '';
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60_000);
    if (min < 1) return t('feed.time.now');
    if (min < 60) return t('feed.time.minutes', { count: min });
    const h = Math.floor(min / 60);
    if (h < 24) return t('feed.time.hours', { count: h });
    const days = Math.floor(h / 24);
    if (days < 7) return t('feed.time.days', { count: days });
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  }, [item.created_at, t, i18n.language]);

  const isSystem = item.source === 'system';
  // Eventos de atividade (rank_up, mission_completed, …) usam o card de evento.
  // Posts de conteúdo (verb `user_post`) renderizam corpo/mídia normalmente —
  // inclusive os gerados por IA, que vêm com `source: system` mas são posts reais.
  const isActivityEvent = item.verb !== 'user_post';
  // Post de cronista (IA): conteúdo `user_post` publicado pelo sistema. Não tem
  // patente real (o autor é um bot), então escondemos o rank e destacamos o
  // avatar com uma borda vermelha.
  const isCronista = item.source === 'system' && !isActivityEvent;
  const meta = EVENT_META[item.verb];

  // Linha do evento de sistema (usa o payload snapshotado).
  const systemLine = () => {
    const p = item.payload ?? {};
    switch (item.verb) {
      case 'mission_completed':
        return t('feed.events.mission_completed', { name: p.mission_name ?? '' });
      case 'rank_up':
        return t('feed.events.rank_up', { rank: p.rank_name ?? '' });
      case 'medal_earned':
        return t('feed.events.medal_earned', { medal: p.medal ?? '' });
      case 'achievement_unlocked':
        return t('feed.events.achievement_unlocked', { name: p.name ?? p.achievement_name ?? '' });
      case 'legion_joined':
        return t('feed.events.legion_joined', { legion: p.legion_name ?? '' });
      case 'campaign_completed':
        return t('feed.events.campaign_completed', { name: p.campaign_name ?? '' });
      default:
        return '';
    }
  };

  return (
    <View className="bg-white border border-[#f0eded] rounded-[18px] overflow-hidden py-4">
      {/* Header do autor */}
      <View className="flex-row items-center px-4">
        <View ref={avatarRef} collapsable={false} className="mr-3">
          <TouchableOpacity onPress={openUser} activeOpacity={0.8}>
            <View
              className={`w-10 h-10 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden ${
                isCronista ? 'border-2 border-primary-500' : ''
              }`}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} resizeMode="cover" />
              ) : (
                <Text className="text-[14px] font-bold text-primary-500">{initials(author.name)}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="flex-1" activeOpacity={0.8} onPress={openUser}>
          <Text className="text-[14px] font-extrabold text-charcoal" numberOfLines={1}>
            {author.name}
          </Text>
          <Text className="text-[11px] text-[#999]" numberOfLines={1}>
            {!isCronista && author.rank?.name ? `${author.rank.name} • ` : ''}
            {relativeTime}
          </Text>
        </TouchableOpacity>
        {!isSystem && (
          <View ref={menuRef} collapsable={false}>
            <TouchableOpacity onPress={openMenu} activeOpacity={0.6} className="pl-2 pr-1 py-1">
              <Text className="text-[20px] text-[#999]">⋯</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Conteúdo */}
      {isActivityEvent ? (
        <View className="flex-row items-start mt-3 mx-4 bg-[#faf7f7] rounded-[12px] p-3">
          <Text className="text-[18px] mr-2">{meta?.emoji ?? '✨'}</Text>
          <View className="flex-1">
            <Text className="text-[13px] text-[#333] leading-[19px]">{systemLine()}</Text>
            {item.verb === 'mission_completed' && (item.payload?.xp_earned ?? 0) > 0 && (
              <Text className="text-[12px] font-bold text-accent-500 mt-1">
                +{item.payload?.xp_earned} {t('common.xp')}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <>
          {item.body ? <CollapsibleBody html={item.body} /> : null}
          <View className="px-0">
            <MediaGallery item={item} />
          </View>
        </>
      )}

      {/* Resumo (reações + comentários), estilo LinkedIn */}
      {(item.reactions.total > 0 || item.comments_count > 0) && (
        <View className="flex-row items-center justify-between mt-3 px-4">
          {item.reactions.total > 0 ? (
            <View ref={reactorsRef} collapsable={false}>
              <TouchableOpacity onPress={openReactors} activeOpacity={0.7}>
                <ReactionCluster reactions={item.reactions} />
              </TouchableOpacity>
            </View>
          ) : (
            <View />
          )}
          {item.comments_count > 0 ? (
            <TouchableOpacity onPress={() => onOpenComments(item)} activeOpacity={0.7}>
              <Text className="text-[12px] text-[#888]">
                {t('feed.commentsCount', { count: item.comments_count })}
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
      )}

      {/* Divisor + barra de ações */}
      <View className="h-px bg-[#f3eeee] mt-2.5" />
      <View className="flex-row mt-1 px-4">
        <FeedReactions
          reactions={item.reactions}
          onReact={(type) => onReact(item.id, type, item.reactions.mine)}
        />
        <TouchableOpacity
          onPress={() => onOpenComments(item)}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-center gap-2 py-2 rounded-[10px]">
          <CommentIcon size={18} color="#666" />
          <Text className="text-[13px] font-bold text-[#666]">{t('feed.comment')}</Text>
        </TouchableOpacity>
      </View>

      {/* Popover: mini-perfil do autor */}
      <AnchoredPopover anchor={userAnchor} onClose={() => setUserAnchor(null)} width={234} align="left">
        <View className="p-3.5">
          <View className="flex-row items-center">
            <View
              className={`w-12 h-12 rounded-full bg-[#efeaea] items-center justify-center overflow-hidden mr-3 ${
                isCronista ? 'border-2 border-primary-500' : ''
              }`}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 48, height: 48 }} resizeMode="cover" />
              ) : (
                <Text className="text-[16px] font-bold text-primary-500">{initials(author.name)}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-extrabold text-charcoal" numberOfLines={1}>
                {author.name}
              </Text>
              {!isCronista && author.rank?.name ? (
                <View className="flex-row items-center mt-0.5">
                  {author.rank.thumb ?? author.rank.image ? (
                    <Image
                      source={{ uri: (author.rank.thumb ?? author.rank.image) as string }}
                      style={{ width: 16, height: 16, marginRight: 4 }}
                      resizeMode="contain"
                    />
                  ) : null}
                  <Text className="text-[12px] text-[#777]" numberOfLines={1}>
                    {author.rank.name}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          {legionName ? (
            <View className="flex-row items-center mt-2.5 pt-2.5 border-t border-[#f3eeee]">
              <Text className="text-[13px] mr-1.5">🦅</Text>
              <Text className="text-[12px] text-[#555]" numberOfLines={1}>
                {legionName}
              </Text>
            </View>
          ) : null}
          {canViewProfile ? (
            <TouchableOpacity
              onPress={goToProfile}
              activeOpacity={0.8}
              className="mt-3 bg-primary-500 rounded-[10px] py-2 items-center">
              <Text className="text-[12px] font-bold text-white">{t('feed.viewProfile')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </AnchoredPopover>

      {/* Popover: menu do post — editar/excluir nos próprios; visualizar nos demais */}
      <AnchoredPopover anchor={menuAnchor} onClose={() => setMenuAnchor(null)} width={172} align="right">
        <TouchableOpacity
          onPress={() => {
            setMenuAnchor(null);
            navigation.navigate('PostDetail', { post: item });
          }}
          activeOpacity={0.7}
          className="flex-row items-center gap-2.5 px-4 py-3">
          <EyeIcon size={17} color="#121212" />
          <Text className="text-[14px] font-bold text-charcoal">{t('feed.view')}</Text>
        </TouchableOpacity>
        {isOwnPost && (
          <>
            <View className="h-px bg-[#f3eeee]" />
            <TouchableOpacity
              onPress={() => {
                setMenuAnchor(null);
                setEditing(true);
              }}
              activeOpacity={0.7}
              className="flex-row items-center gap-2.5 px-4 py-3">
              <EditIcon size={17} color="#121212" />
              <Text className="text-[14px] font-bold text-charcoal">{t('feed.edit')}</Text>
            </TouchableOpacity>
            <View className="h-px bg-[#f3eeee]" />
            <TouchableOpacity
              onPress={confirmDelete}
              activeOpacity={0.7}
              className="flex-row items-center gap-2.5 px-4 py-3">
              <TrashIcon size={17} color="#c0392b" />
              <Text className="text-[14px] font-bold text-[#c0392b]">{t('feed.delete')}</Text>
            </TouchableOpacity>
          </>
        )}
      </AnchoredPopover>

      {/* Popover: quem reagiu (usuários + reações) */}
      <ReactorsPopover
        eventId={item.id}
        anchor={reactorsAnchor}
        onClose={() => setReactorsAnchor(null)}
      />

      <EditPostModal item={editing ? item : null} onClose={() => setEditing(false)} />
    </View>
  );
}

// Nº máximo de linhas do preview colapsado. Acima disso o texto é cortado e o
// "…Ler mais" (azul) é emendado inline no fim da última linha, dando sensação
// de continuidade (não é um botão separado abaixo).
const MAX_PREVIEW_LINES = 7;
const READ_MORE_BLUE = '#1D6FE0';
const BODY_CLASS = 'text-[14px] text-[#333] leading-[20px]';

// Projeção texto-puro do HTML do post (para o preview cortado). Preserva quebras
// de bloco como \n; o conteúdo rico (negrito etc.) volta ao expandir.
function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-3]|ul|ol)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Apara o final do texto — remove a última palavra (ou alguns caracteres, se
// for uma palavra única longa). Usado para abrir espaço até o "…Ler mais" caber
// na mesma linha do corte.
function trimTail(s: string): string {
  const t = s.replace(/\s+$/, '');
  const idx = t.lastIndexOf(' ');
  if (idx > 0) return t.slice(0, idx).replace(/\s+$/, '');
  return t.slice(0, Math.max(0, t.length - 4));
}

function CollapsibleBody({ html }: { html: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const plain = React.useMemo(() => htmlToText(html), [html]);
  // null = medindo; false = cabe (mostra rich); string = texto cortado p/ preview.
  const [clip, setClip] = useState<string | null | false>(null);
  // Trava quando o preview + "…Ler mais" já cabe nas MAX linhas (para o loop).
  const [stable, setStable] = useState(false);
  const measured = useRef(false);
  const iterations = useRef(0);
  const readMore = t('feed.readMore');

  // Expandido → conteúdo rico completo + "Ler menos".
  if (expanded) {
    return (
      <View className="mt-3 px-4">
        <FeedHtml html={html} className={BODY_CLASS} />
        <Text
          onPress={() => setExpanded(false)}
          className="text-[13px] font-bold mt-1"
          style={{ color: READ_MORE_BLUE }}>
          {t('feed.readLess')}
        </Text>
      </View>
    );
  }

  const verifying = typeof clip === 'string' && !stable;

  return (
    <View className="mt-3 px-4">
      {clip === null || verifying ? (
        // Medindo/convergindo: preview simples cortado às MAX linhas (sem o link
        // ainda, para nunca exibir um "…Ler mais" truncado pelo SO durante o ajuste).
        <Text className={BODY_CLASS} numberOfLines={MAX_PREVIEW_LINES}>
          {plain}
        </Text>
      ) : clip === false ? (
        // Cabe inteiro → conteúdo rico.
        <FeedHtml html={html} className={BODY_CLASS} />
      ) : (
        // Estável: preview cortado + "…Ler mais" inline. SEM numberOfLines — o
        // verificador já garantiu que cabe, então o SO não trunca o link.
        <Text className={BODY_CLASS}>
          {clip}
          <Text
            onPress={() => setExpanded(true)}
            style={{ color: READ_MORE_BLUE, fontWeight: '700' }}>
            {readMore}
          </Text>
        </Text>
      )}

      {/* Medidor inicial invisível: conta as linhas do texto completo. */}
      {clip === null && (
        <Text
          className={BODY_CLASS}
          style={{ position: 'absolute', left: 0, right: 0, opacity: 0 }}
          onTextLayout={(e) => {
            if (measured.current) return;
            measured.current = true;
            const lines = e.nativeEvent.lines;
            if (lines.length <= MAX_PREVIEW_LINES) {
              setClip(false);
              return;
            }
            const first = lines
              .slice(0, MAX_PREVIEW_LINES)
              .map((l) => l.text)
              .join('')
              .replace(/\s+$/, '');
            setClip(first);
          }}>
          {plain}
        </Text>
      )}

      {/* Verificador invisível: mede "preview + …Ler mais" SEM limite de linhas;
          se estourar MAX, apara mais uma palavra e remede — até o link caber na
          mesma linha (nunca quebra para uma linha nova). */}
      {verifying && (
        <Text
          className={BODY_CLASS}
          style={{ position: 'absolute', left: 0, right: 0, opacity: 0 }}
          onTextLayout={(e) => {
            const lines = e.nativeEvent.lines;
            const last = lines[lines.length - 1]?.text ?? '';
            // Texto do preview que sobra na última linha, DEPOIS de remover o
            // "…Ler mais" do fim. Se sobrar conteúdo, o link está colado ao corte;
            // se não sobrar, o link caiu sozinho numa linha nova → aparar mais.
            const tailBeforeLink = last.slice(0, Math.max(0, last.length - readMore.length)).trim();
            const glued = lines.length <= MAX_PREVIEW_LINES && tailBeforeLink.length > 0;
            if (!glued && iterations.current < 80 && (clip as string).length > 0) {
              iterations.current += 1;
              setClip((c) => (typeof c === 'string' ? trimTail(c) : c));
            } else {
              setStable(true);
            }
          }}>
          {clip}
          <Text style={{ fontWeight: '700' }}>{readMore}</Text>
        </Text>
      )}
    </View>
  );
}
