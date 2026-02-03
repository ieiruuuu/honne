import { NextRequest, NextResponse } from 'next/server';
import { exchangeLineCodeForToken, getLineProfile } from '@/lib/line-auth';
import { supabase } from '@/lib/supabase';

/**
 * LINE Authorization Code を Access Token に交換し、
 * ユーザー情報を取得して Supabase に保存
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // 1. Authorization Code を Access Token に交換
    const tokenResponse = await exchangeLineCodeForToken(code);

    // 2. Access Token でユーザープロフィール取得
    const lineProfile = await getLineProfile(tokenResponse.access_token);

    // 3. Supabase に保存 (または既存ユーザーを取得)
    // Note: Supabase が設定されていない場合はモックデータを返す
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

    let userData;

    if (isSupabaseConfigured) {
      // Supabase で LINE ユーザーを検索または作成
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('line_user_id', lineProfile.userId)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        // PGRST116 = レコードが見つからない (エラーではない)
        throw searchError;
      }

      if (existingUser) {
        userData = existingUser;
      } else {
        // 新規ユーザーを作成
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            line_user_id: lineProfile.userId,
            display_name: lineProfile.displayName,
            picture_url: lineProfile.pictureUrl,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        userData = newUser;
      }
    } else {
      // モックモード (Supabase 未設定)
      userData = {
        id: lineProfile.userId,
        line_user_id: lineProfile.userId,
        display_name: lineProfile.displayName,
        picture_url: lineProfile.pictureUrl,
        created_at: new Date().toISOString(),
      };
    }

    // 4. ユーザー情報を返す
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id || lineProfile.userId,
        email: null, // LINE は email を提供しない
        nickname: lineProfile.displayName,
        avatar_url: lineProfile.pictureUrl,
        provider: 'line',
        line_user_id: lineProfile.userId,
        created_at: userData.created_at,
      },
      access_token: tokenResponse.access_token,
    });
  } catch (error) {
    console.error('LINE token exchange error:', error);
    return NextResponse.json(
      {
        error: 'Failed to exchange LINE token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
