/**
 * 日本語ラベル定数
 * アプリ全体で使用する日本語文字列を一元管理
 */

export const LABELS = {
  // アクション
  POST: "投稿する",
  POSTING: "投稿中...",
  LIKES: "いいね",
  COMMENT: "コメント",
  LOAD_MORE: "もっと見る",
  EDIT: "編集",
  DELETE: "削除",
  CANCEL: "キャンセル",
  SAVE: "保存",
  SELECT_CATEGORY: "カテゴリーを選択",
  MARK_ALL_READ: "すべて既読にする",
  CONFIRM: "確認",
  TEMPORARY_SAVE: "下書き保存",
  
  // ナビゲーション
  HOME: "ホーム",
  NOTIFICATIONS: "お知らせ",
  WRITE: "投稿",
  MY_PAGE: "マイページ",
  SEARCH: "検索",
  PROFILE: "プロフィール",
  SETTINGS: "設定",
  LOGOUT: "ログアウト",
  
  // メッセージ
  WELCOME_TITLE: "本音で語れる場所へようこそ",
  WELCOME_DESC: "社会人のための匿名コミュニティです。悩み、愚痴、質問を気軽に共有しましょう。",
  NO_POSTS: "まだ投稿がありません",
  NO_NOTIFICATIONS: "通知はありません",
  NO_SEARCH_RESULTS: "検索結果がありません",
  LOADING: "読み込み中...",
  SEARCH_PLACEHOLDER: "キーワードで検索...",
  MY_POSTS: "投稿履歴",
  MY_LIKED_POSTS: "いいねした投稿",
  
  // フォーム
  CONTENT_LABEL: "内容",
  NICKNAME_LABEL: "ニックネーム",
  CATEGORY_LABEL: "カテゴリー",
  
  // 時間表示
  JUST_NOW: "たった今",
  MINUTES_AGO: "分前",
  HOURS_AGO: "時間前",
  DAYS_AGO: "日前",
} as const;

/**
 * カテゴリー定数
 * 比較と共感を最大化するための戦略的カテゴリー設計
 */
export const CATEGORIES = {
  ALL: "すべて",
  SALARY: "年収・手取り",
  WHITE_BLACK: "ホワイト・ブラック判定",
  BONUS: "ボーナス報告",
  CAREER: "転職のホンネ",
  RELATIONSHIPS: "人間関係・上司",
  POLITICS: "社内政治・派閥",
  OVERTIME: "サービス残業・待遇",
  BENEFITS: "福利厚生・環境",
  MENTAL: "メンタル・悩み",
  VENTING: "つぶやき",
} as const;

/**
 * カテゴリー別アイコン設定（Lucide-react）
 */
export const CATEGORY_ICONS = {
  "年収・手取り": "Coins",
  "ホワイト・ブラック判定": "Scale",
  "ボーナス報告": "Gift",
  "転職のホンネ": "Briefcase",
  "人間関係・上司": "Users",
  "社内政治・派閥": "Shield",
  "サービス残業・待遇": "Clock",
  "福利厚生・環境": "Heart",
  "メンタル・悩み": "Brain",
  "つぶやき": "MessageCircle",
} as const;

/**
 * カテゴリー別カラー設定
 */
export const CATEGORY_COLORS = {
  "年収・手取り": "bg-amber-100 text-amber-800 border-amber-200",
  "ホワイト・ブラック判定": "bg-slate-100 text-slate-800 border-slate-200",
  "ボーナス報告": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "転職のホンネ": "bg-blue-100 text-blue-800 border-blue-200",
  "人間関係・上司": "bg-purple-100 text-purple-800 border-purple-200",
  "社内政治・派閥": "bg-red-100 text-red-800 border-red-200",
  "サービス残業・待遇": "bg-orange-100 text-orange-800 border-orange-200",
  "福利厚生・環境": "bg-pink-100 text-pink-800 border-pink-200",
  "メンタル・悩み": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "つぶやき": "bg-gray-100 text-gray-800 border-gray-200",
} as const;

export const PLACEHOLDERS = {
  POST_CONTENT: "今、何を考えていますか？",
  POST_NICKNAME: "ニックネーム (例: 匿名太郎)",
  COMMENT_CONTENT: "コメントを書く...",
  SEARCH: "検索...",
  
  // カテゴリー別動的プレースホルダー
  SALARY_HINT: "例: 「3年目、SE、年収450万円、手取り320万円」など詳細を書くと正確なフィードバックが得られます",
  BONUS_HINT: "例: 「夏のボーナス○ヶ月分」「業績連動で○万円」など具体的な金額や条件を共有してください",
  WHITE_BLACK_HINT: "例: 「残業時間」「休日出勤」「パワハラの有無」など判定材料を詳しく書いてください",
} as const;

export const ERROR_MESSAGES = {
  GENERIC: "エラーが発生しました",
  NETWORK: "ネットワークエラーです",
  POST_FAILED: "投稿に失敗しました",
  LOAD_FAILED: "読み込みに失敗しました",
  UNSAVED_CHANGES: "保存されていない変更があります。本当に閉じますか？",
} as const;

export const SUCCESS_MESSAGES = {
  POST_CREATED: "投稿しました",
  POST_UPDATED: "更新しました",
  POST_DELETED: "削除しました",
  EMPATHY_ADDED: "共感しました",
} as const;
