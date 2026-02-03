/**
 * フィード・投稿機能関連の日本語定数
 */

export const FEED_LABELS = {
  WRITE_POST: "投稿する",
  WRITING: "投稿中...",
  DRAFT_SAVE: "下書き保存",
  DRAFT_SAVED: "下書きを保存しました",
  DRAFT_LOAD_CONFIRM: "保存された下書きがあります。読み込みますか？",
  
  // フォーム
  CONTENT_LABEL: "内容",
  NICKNAME_LABEL: "ニックネーム",
  CATEGORY_LABEL: "カテゴリー",
  CATEGORY_REQUIRED: "カテゴリーを選択してください",
  
  // プレースホルダー
  CONTENT_PLACEHOLDER: "今、職場で何が起きていますか？",
  NICKNAME_PLACEHOLDER: "ニックネーム (例: 匿名太郎)",
  
  // 文字数制限
  CONTENT_MIN_LENGTH: 10,
  CONTENT_MAX_LENGTH: 1000,
  NICKNAME_MIN_LENGTH: 2,
  NICKNAME_MAX_LENGTH: 20,
} as const;

export const FEED_ERROR_MESSAGES = {
  CONTENT_TOO_SHORT: "投稿内容は10文字以上で入力してください",
  CONTENT_TOO_LONG: "投稿内容は1000文字以内で入力してください",
  NICKNAME_TOO_SHORT: "ニックネームは2文字以上で入力してください",
  NICKNAME_TOO_LONG: "ニックネームは20文字以内で入力してください",
  CATEGORY_REQUIRED: "カテゴリーを選択してください",
  POST_FAILED: "投稿に失敗しました",
} as const;

export const FEED_SUCCESS_MESSAGES = {
  POST_CREATED: "投稿しました",
} as const;
