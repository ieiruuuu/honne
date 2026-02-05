/**
 * ランダムニックネーム生成ユーティリティ
 * 
 * 日本語の形容詞 + 名詞の組み合わせで匿名感のあるニックネームを生成
 */

/**
 * 形容詞リスト（雰囲気を表現）
 */
const ADJECTIVES = [
  "優しい",
  "元気な",
  "静かな",
  "明るい",
  "真面目な",
  "謙虚な",
  "素直な",
  "穏やかな",
  "勇敢な",
  "賢い",
  "面白い",
  "誠実な",
  "親切な",
  "冷静な",
  "素朴な",
  "陽気な",
  "控えめな",
  "率直な",
  "温厚な",
  "のんびりした",
];

/**
 * 名詞リスト（社会人・匿名性を意識）
 */
const NOUNS = [
  "会社員",
  "サラリーマン",
  "ビジネスマン",
  "社会人",
  "労働者",
  "新入社員",
  "中堅社員",
  "ベテラン",
  "リーマン",
  "営業マン",
  "事務員",
  "エンジニア",
  "管理職",
  "平社員",
  "転職者",
  "求職者",
  "同僚",
  "先輩",
  "後輩",
  "訪問者",
  "投稿者",
  "ユーザー",
  "旅人",
  "名無し",
  "匿名さん",
];

/**
 * ランダムニックネームを生成
 * 
 * @returns ランダムに生成されたニックネーム（例: "優しい会社員"）
 */
export function generateRandomNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective}${noun}`;
}

/**
 * デフォルトニックネーム
 */
export const DEFAULT_NICKNAME = "匿名の訪問者";

/**
 * ニックネームのバリデーション
 */
export interface NicknameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * ニックネームのバリデーション
 * 
 * @param nickname - 検証するニックネーム
 * @returns バリデーション結果
 */
export function validateNickname(nickname: string): NicknameValidationResult {
  // 空白チェック
  if (!nickname || nickname.trim().length === 0) {
    return {
      valid: false,
      error: "ニックネームを入力してください",
    };
  }

  // 長さチェック
  const trimmed = nickname.trim();
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: "ニックネームは2文字以上にしてください",
    };
  }

  if (trimmed.length > 10) {
    return {
      valid: false,
      error: "ニックネームは10文字以内にしてください",
    };
  }

  // 特殊文字チェック（英数字、ひらがな、カタカナ、漢字のみ許可）
  const validPattern = /^[a-zA-Z0-9ぁ-んァ-ヶー一-龠々〆〤]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      error: "特殊文字は使用できません",
    };
  }

  return { valid: true };
}

/**
 * ニックネームをサニタイズ（トリム）
 * 
 * @param nickname - サニタイズするニックネーム
 * @returns トリムされたニックネーム
 */
export function sanitizeNickname(nickname: string): string {
  return nickname.trim();
}
