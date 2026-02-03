/**
 * LINE OAuth 2.0 直接連携
 * Supabase Dashboard の Provider 設定なしで動作
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * LINE OAuth エンドポイント
 */
export const LINE_AUTH_ENDPOINTS = {
  AUTHORIZE: 'https://access.line.me/oauth2/v2.1/authorize',
  TOKEN: 'https://api.line.me/oauth2/v2.1/token',
  PROFILE: 'https://api.line.me/v2/profile',
  REVOKE: 'https://api.line.me/oauth2/v2.1/revoke',
} as const;

/**
 * LINE ユーザープロフィール
 */
export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

/**
 * LINE トークンレスポンス
 */
export interface LineTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
}

/**
 * LINE 認証 URL を生成
 * @returns 認証 URL と state (CSRF 対策)
 */
export function generateLineAuthUrl(): { url: string; state: string } {
  const clientId = process.env.LINE_CLIENT_ID || process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('LINE OAuth configuration is missing. Please set LINE_CLIENT_ID and NEXT_PUBLIC_LINE_REDIRECT_URI in .env.local');
  }

  // CSRF 対策のため state を生成
  const state = uuidv4();
  
  // LocalStorage に state を保存 (検証用)
  if (typeof window !== 'undefined') {
    localStorage.setItem('line_oauth_state', state);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'profile openid', // プロフィール情報を取得
    nonce: uuidv4(), // リプレイ攻撃対策
  });

  const url = `${LINE_AUTH_ENDPOINTS.AUTHORIZE}?${params.toString()}`;

  return { url, state };
}

/**
 * Authorization Code を Access Token に交換
 * @param code - LINE から返された Authorization Code
 * @returns Access Token とユーザー情報
 */
export async function exchangeLineCodeForToken(
  code: string
): Promise<LineTokenResponse> {
  const clientId = process.env.LINE_CLIENT_ID;
  const clientSecret = process.env.LINE_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('LINE OAuth configuration is missing');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(LINE_AUTH_ENDPOINTS.TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange LINE code: ${error}`);
  }

  const data: LineTokenResponse = await response.json();
  return data;
}

/**
 * Access Token を使って LINE ユーザープロフィールを取得
 * @param accessToken - LINE Access Token
 * @returns ユーザープロフィール情報
 */
export async function getLineProfile(accessToken: string): Promise<LineProfile> {
  const response = await fetch(LINE_AUTH_ENDPOINTS.PROFILE, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get LINE profile: ${error}`);
  }

  const profile: LineProfile = await response.json();
  return profile;
}

/**
 * State を検証 (CSRF 対策)
 * @param receivedState - Callback URL から受け取った state
 * @returns 検証結果
 */
export function verifyLineState(receivedState: string): boolean {
  if (typeof window === 'undefined') return false;

  const storedState = localStorage.getItem('line_oauth_state');
  localStorage.removeItem('line_oauth_state'); // 使用後は削除

  return storedState === receivedState;
}
