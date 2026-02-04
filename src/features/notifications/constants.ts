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
  
  // ゲストユーザー向けメッセージ
  GUEST_LOGIN_PROMPT: "ログインすると、あなたへの通知を確認できます",
  GUEST_LOGIN_BUTTON: "ログイン",
  GUEST_HOT_POSTS_SUBTITLE: "今、話題の投稿をチェックしましょう！",
  NEW_HOT_POSTS: "件の話題の投稿",
} as const;

// 人気投稿しきい値（いいね数）
export const HOT_POST_THRESHOLD = 20;

// 最近の人気投稿（24時間以内）
export const HOT_POST_HOURS = 24;
