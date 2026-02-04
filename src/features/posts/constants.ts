/**
 * 投稿詳細ページの日本語ラベル
 */

export const POST_DETAIL_LABELS = {
  // ナビゲーション
  BACK: "戻る",
  
  // エラーメッセージ
  NOT_FOUND_TITLE: "投稿が見つかりません",
  NOT_FOUND_MESSAGE: "この投稿は削除されたか、存在しない可能性があります",
  ERROR_TITLE: "エラーが発生しました",
  BACK_TO_HOME: "ホームに戻る",
  
  // コメントセクション
  COMMENTS_TITLE: "コメント",
  WRITE_COMMENT: "コメントを書く...",
  COMMENT_PLACEHOLDER: "コメントを書く...",
  
  // ローディング
  LOADING: "読み込み中...",
  
  // 作成者情報
  DEFAULT_COMPANY: "A社",
  SALARY_LABEL: "年収",
  COMPANY_LABEL: "会社",
  
  // ログイン必須メッセージ
  LOGIN_REQUIRED_TITLE: "ログインが必要です",
  LOGIN_REQUIRED_COMMENT: "ログイン後にコメントを作成できます",
  LOGIN_REQUIRED_POST: "ログイン後に投稿を作成できます",
  LOGIN_REQUIRED_LIKE: "ログイン後にいいねできます",
  LOGIN_TO_COMMENT: "ログインしてコメントする",
  LOGIN_TO_POST: "ログインして投稿する",
  LOGIN_TO_LIKE: "ログインしていいねする",
  LOGIN_PROMPT: "コメントを書くにはログインしてください",
} as const;
