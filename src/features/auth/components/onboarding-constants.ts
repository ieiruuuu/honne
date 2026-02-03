/**
 * オンボーディング関連の日本語ラベルと定数
 */

export const ONBOARDING_LABELS = {
  // タイトル
  TITLE: "より良い体験のために",
  SUBTITLE: "職場情報を教えてください",
  
  // フィールド
  COMPANY_LABEL: "会社名",
  COMPANY_PLACEHOLDER: "例: ○○株式会社",
  SALARY_LABEL: "年収",
  SALARY_PLACEHOLDER: "万円",
  
  // ボタン
  SAVE_AND_START: "保存して始める",
  SKIP: "後で入力する",
  
  // 説明
  OPTIONAL_NOTICE: "入力しなくても サービスをご利用いただけます",
  DEFAULT_COMPANY_NOTICE: "会社名を入力しない場合、「A社」として表示されます",
  PRIVACY_NOTICE: "入力した情報は他のユーザーには表示されません",
  
  // メッセージ
  SAVE_SUCCESS: "情報を保存しました",
  SKIP_SUCCESS: "後で設定できます",
} as const;

/**
 * 年収の選択肢（万円単位）
 */
export const SALARY_OPTIONS = [
  { value: 0, label: "選択しない" },
  { value: 300, label: "300万円未満" },
  { value: 400, label: "300-400万円" },
  { value: 500, label: "400-500万円" },
  { value: 600, label: "500-600万円" },
  { value: 700, label: "600-700万円" },
  { value: 800, label: "700-800万円" },
  { value: 900, label: "800-900万円" },
  { value: 1000, label: "900-1000万円" },
  { value: 1200, label: "1000-1200万円" },
  { value: 1500, label: "1200-1500万円" },
  { value: 2000, label: "1500万円以上" },
] as const;

/**
 * デフォルト会社名（未入力時）
 */
export const DEFAULT_COMPANY_NAME = "A社";
