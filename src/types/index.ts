/**
 * カテゴリータイプ（厳格な型定義）
 * ユーザーが選択できるすべてのカテゴリーを定義
 */
export type Category =
  | "年収・手取り"
  | "ホワイト・ブラック判定"
  | "ボーナス報告"
  | "転職のホンネ"
  | "人間関係・上司"
  | "社内政治・派閥"
  | "サービス残業・待遇"
  | "福利厚生・環境"
  | "メンタル・悩み"
  | "つぶやき";

export interface Post {
  id: string;
  content: string;
  category: Category; // 厳格なカテゴリー型
  nickname: string;
  likes_count: number;
  comments_count?: number; // 댓글 수 (옵셔널)
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  nickname: string;
  created_at: string;
}

/**
 * 알림 타입
 * - COMMENT: 내 게시글에 댓글이 달렸을 때
 * - LIKE: 내 게시글에 좋아요가 달렸을 때
 * - HOT_POST: 인기 게시글 알림 (likes_count 높은 게시글)
 */
export interface Notification {
  id: string;
  type: "COMMENT" | "LIKE" | "HOT_POST";
  post_id: string;
  content: string; // 알림 메시지 내용
  is_read: boolean; // 읽음 여부
  created_at: string;
}

/**
 * 검색 결과 타입
 */
export interface SearchResult {
  posts: Post[];
  total: number;
}

/**
 * 認証プロバイダー
 */
export type AuthProvider = 'line' | 'email';

/**
 * ユーザー情報
 */
export interface User {
  id: string;
  email?: string;
  nickname: string; // 匿名ニックネーム
  avatar_url?: string;
  provider: AuthProvider;
  company_name?: string; // 会社名（オプション）
  salary?: number; // 年収（オプション）
  has_onboarded?: boolean; // オンボーディング完了フラグ
  created_at: string;
}

/**
 * 認証状態
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
