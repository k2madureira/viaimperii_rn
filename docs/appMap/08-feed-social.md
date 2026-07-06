# 08 — Feed Social, Post, Notificações e Busca

Componentes do feed social usados na Dashboard e na tela de detalhe. Fontes:
`screens/dashboard/components/feed/*`, `screens/postDetail`,
`screens/dashboard/components/notificationsButton`, `components/globalSearchModal`.

---

## FeedCard (`dashboard/components/feed/FeedCard`)

Card de post/evento usado na Dashboard e no PostDetail.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **Avatar / nome** do autor | toque | Popover (mini-perfil) | Mostra patente + legião |
| Popover → **Ver perfil** | toque | `Navigate → Profile { userId }` | Só para autores reais (não eventos de sistema) |
| **⋯ menu** (posts de usuário) | toque | Popover | Opções do post |
| Menu → **Visualizar** | toque | `Navigate → PostDetail { post }` | Abre o detalhe do post |
| Menu → **Editar** (post próprio) | toque | Modal `EditPostModal` | Edita o post |
| Menu → **Excluir** (post próprio) | toque | `Alert` | Confirma → `useDeletePost` |
| **Reações** (barra) | toque | — | `onReact` adiciona/remove reação |
| **Cluster de reações** (resumo) | toque | Popover `ReactorsPopover` | Quem reagiu |
| **Comentar** / contagem de comentários | toque | Modal ou foca input | Dashboard → `CommentsModal`; PostDetail → foca o campo de comentar |
| "…Ler mais" / "Ler menos" | toque | — | Expande/colapsa o corpo do post |
| Mídia | toque | Modal | Abre imagem/vídeo em visualizador |

---

## PostDetail (`screens/postDetail`)

Recebe `{ post }`. `HomeStack` com `Navbar` + FeedCard no topo + lista de
comentários.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **‹ Voltar** | toque | `goBack()` | Volta à origem (feed/busca/notificação) |
| FeedCard (topo) | ações | vários | Mesmas interações do FeedCard acima (comentar → foca input) |
| Campo de comentário | digitar | — | Habilita o botão enviar |
| **Enviar (➤)** | toque | — | `useCreateComment` publica o comentário |
| Scroll até o fim | gesto | — | Paginação incremental de comentários |

---

## Notificações (`dashboard/components/notificationsButton`)

Sino no topo da Dashboard. Badge = não lidas; desabilitado se 0.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **Sino** | toque | Popover | Abre a lista de notificações |
| **Marcar todas como lidas** | toque | — | `useMarkAllNotificationsRead` |
| Item de notificação | toque | (varia) | Marca como lida; se for de post (comment/reaction/mention) → `Navigate → PostDetail { post }` |
| Scroll até o fim | gesto | — | Paginação da lista |

---

## Busca global (`components/globalSearchModal`)

Aberto pela SearchBar da Dashboard. Modal em tela cheia (usuários, hashtags,
posts).

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Campo de busca | digitar | — | Busca com debounce |
| **Cancelar** | toque | Fecha modal | Volta à Dashboard |
| Resultado **Usuário** | toque | `Navigate → Profile { userId }` | Fecha modal e abre o perfil |
| Resultado **Post** | toque | `Navigate → PostDetail { post }` | Fecha modal e abre o post |
| Resultado **Hashtag** | — | — | Exibe contagem (sem navegação atual) |

---

## Criar post (`dashboard/components/feed/CreatePostModal`)

Aberto pela aba central **CreatePost** (Bottom Tabs) — que **não navega**,
apenas abre este modal. Permite compor texto/mídia e escolher o escopo
(legião/província conforme o perfil). Publicar cria o post e fecha o modal;
cancelar fecha sem publicar.
