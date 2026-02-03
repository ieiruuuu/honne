/**
 * 通知機能関連の日本語定数
 */

export const NOTIFICATION_LABELS = {
  TITLE: "お知らせ",
  HOT_POSTS: "話題の投稿",
  HOT_POST_ICON: "🔥",
  PERSONAL_NOTIFICATIONS: "あなたへの通知",
  MARK_ALL_READ: "すべて既読にする",
  NO_NOTIFICATIONS: "通知はありません",
  UNREAD_COUNT: "件の未読通知",
  DELETE_CONFIRM: "この通知を削除しますか？",
  
  // 通知タイプ別メッセージ
  LIKE_MESSAGE: "さんがあなたの投稿にいいねしました",
  COMMENT_MESSAGE: "さんがあなたの投稿にコメントしました",
  HOT_POST_MESSAGE: "人気の投稿があります",
} as const;

// インギ投稿しきい値（いいね数）
export const HOT_POST_THRESHOLD = 20;
