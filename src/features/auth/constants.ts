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
  LOGIN_WITH_X: "Xでログイン",
  LOGIN_WITH_APPLE: "Appleでログイン",
  LOGIN_WITH_EMAIL: "メールでログイン",
  
  LOGOUT: "ログアウト",
  CANCEL: "キャンセル",
  
  // プレースホルダー
  EMAIL_PLACEHOLDER: "メールアドレスを入力",
  SEND_MAGIC_LINK: "マジックリンクを送信",
  
  // メッセージ
  MAGIC_LINK_SENT: "メールを送信しました。リンクをクリックしてログインしてください。",
  LOGIN_REQUIRED: "ログインが必要です",
  LOGIN_SUCCESS: "ログインしました",
  LOGOUT_SUCCESS: "ログアウトしました",
  LOGIN_ERROR: "ログインに失敗しました",
  
  // 情報
  WHY_LOGIN: "ログインすると以下が可能になります",
  BENEFIT_1: "投稿の保存と管理",
  BENEFIT_2: "いいねとコメント",
  BENEFIT_3: "通知の受信",
  BENEFIT_4: "プロフィールのカスタマイズ",
} as const;

/**
 * ソーシャルログインプロバイダーの設定
 */
export const AUTH_PROVIDERS = {
  line: {
    name: 'LINE',
    color: '#00B900', // LINE 公式カラー
    icon: '💬',
    popular: true, // 日本で人気
  },
  twitter: {
    name: 'X',
    color: '#000000', // X (Twitter) 新ブランドカラー
    icon: '𝕏',
    popular: true,
  },
  apple: {
    name: 'Apple',
    color: '#000000',
    icon: '',
    popular: true,
  },
  email: {
    name: 'Email',
    color: '#6B7280',
    icon: '✉️',
    popular: false,
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
