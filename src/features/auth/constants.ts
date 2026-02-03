/**
 * 認証関連の日本語ラベルと定数
 */

export const AUTH_LABELS = {
  // タイトル
  LOGIN_TITLE: "ログイン",
  SIGNUP_TITLE: "新規登録",
  WELCOME: "本音へようこそ",
  
  // 説明文
  ANONYMOUS_GUARANTEE: "匿名性が保証されます",
  REAL_NAME_NOT_EXPOSED: "本名は表示されません",
  SAFE_LOGIN: "安心してログインできます",
  
  // ボタン
  LOGIN_WITH_LINE: "LINEでログイン",
  LOGIN_BUTTON: "ログイン",
  SIGNUP_BUTTON: "新規登録",
  LOGOUT: "ログアウト",
  CANCEL: "キャンセル",
  
  // フォーム
  EMAIL_LABEL: "メールアドレス",
  EMAIL_PLACEHOLDER: "example@email.com",
  PASSWORD_LABEL: "パスワード",
  PASSWORD_PLACEHOLDER: "6文字以上",
  PASSWORD_CONFIRM_LABEL: "パスワード（確認）",
  PASSWORD_CONFIRM_PLACEHOLDER: "もう一度入力してください",
  
  // トグル
  NO_ACCOUNT: "アカウントをお持ちでないですか？",
  HAVE_ACCOUNT: "すでにアカウントをお持ちですか？",
  GOTO_SIGNUP: "新規登録",
  GOTO_LOGIN: "ログイン",
  
  // 区切り
  OR_DIVIDER: "または",
  
  // メッセージ
  LOGIN_REQUIRED: "ログインが必要です",
  LOGIN_SUCCESS: "ログインしました",
  SIGNUP_SUCCESS: "登録が完了しました",
  LOGOUT_SUCCESS: "ログアウトしました",
  LOGIN_ERROR: "ログインに失敗しました",
  SIGNUP_ERROR: "登録に失敗しました",
  EMAIL_CONFIRMATION_REQUIRED: "確認メールを送信しました。メールのリンクをクリックして登録を完了してください。",
  PASSWORD_MISMATCH: "パスワードが一致しません",
  PASSWORD_TOO_SHORT: "パスワードは6文字以上で入力してください",
  INVALID_EMAIL: "有効なメールアドレスを入力してください",
  
  // 情報
  WHY_LOGIN: "ログインすると以下が可能になります",
  BENEFIT_1: "投稿の保存と管理",
  BENEFIT_2: "いいねとコメント",
  BENEFIT_3: "通知の受信",
  BENEFIT_4: "プロフィールのカスタマイズ",
} as const;

/**
 * ソーシャルログインプロバイダーの設定
 * 現在は LINE のみサポート
 */
export const AUTH_PROVIDERS = {
  line: {
    name: 'LINE',
    color: '#00B900', // LINE 公式カラー
    icon: '💬',
    popular: true, // 日本で人気
  },
} as const;

/**
 * ランダムニックネーム生成用のパーツ
 */
export const NICKNAME_PREFIXES = [
  "匿名の",
  "名無しの",
  "通りすがりの",
  "謎の",
  "ひそかな",
  "静かな",
  "普通の",
  "一般の",
] as const;

export const NICKNAME_SUFFIXES = [
  "サラリーマン",
  "会社員",
  "社員",
  "勤め人",
  "ワーカー",
  "ビジネスマン",
  "オフィスワーカー",
  "働き人",
] as const;
