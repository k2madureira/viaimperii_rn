import { FeedAuthor, FeedItem } from '../feed';

export interface HashtagResult {
  tag: string;
  posts_count: number;
}

// Busca global (§19) — cobre usuários, hashtags e posts numa só chamada.
export interface GlobalSearchResponse {
  users: FeedAuthor[];
  hashtags: HashtagResult[];
  posts: FeedItem[];
}
