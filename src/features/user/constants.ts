/**
 * ユーザー機能関連の日本語定数
 */

export const USER_LABELS = {
  MY_PAGE: "マイページ",
  MY_POSTS: "投稿履歴",
  MY_LIKED_POSTS: "いいねした投稿",
  PROFILE: "プロフィール",
  SETTINGS: "設定",
  LOGOUT: "ログアウト",
  
  // ニックネーム
  NICKNAME: "ニックネーム",
  REGENERATE_NICKNAME: "ニックネームを再生成",
  NICKNAME_REGENERATED: "ニックネームを変更しました",
  
  // 統計
  POSTS_COUNT: "投稿",
  LIKES_RECEIVED: "もらったいいね",
  COMMENTS_RECEIVED: "もらったコメント",
  
  // フィルター
  FILTER_ALL: "すべて",
  FILTER_BY_CATEGORY: "カテゴリー別",
  SORT_BY: "並び替え",
  SORT_LATEST: "新しい順",
  SORT_POPULAR: "人気順",
} as const;

// ランダムニックネーム生成用の候補
export const NICKNAME_PREFIXES = [
  "匿名",
  "名無し",
  "通りすがり",
  "サラリーマン",
  "社会人",
  "会社員",
  "転職希望",
  "悩める",
  "頑張る",
] as const;

export const NICKNAME_SUFFIXES = [
  "太郎",
  "次郎",
  "三郎",
  "さん",
  "A",
  "B",
  "C",
  "1号",
  "2号",
  "3号",
] as const;
