import { useState, useEffect } from "react";
import { NICKNAME_PREFIXES, NICKNAME_SUFFIXES } from "../constants";

const NICKNAME_STORAGE_KEY = "user_nickname";

/**
 * ニックネーム管理カスタムフック
 * 
 * 機能:
 * - ランダムニックネーム生成
 * - LocalStorageに保存
 * - 再生成機能
 * 
 * @returns nickname - 現在のニックネーム
 * @returns regenerateNickname - ニックネーム再生成関数
 */
export function useNickname() {
  const [nickname, setNickname] = useState<string>("");

  /**
   * ランダムニックネーム生成
   */
  const generateRandomNickname = (): string => {
    const prefix =
      NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
    const suffix =
      NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
    return `${prefix}${suffix}`;
  };

  /**
   * 初期化：LocalStorageから読み込み or 新規生成
   */
  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_STORAGE_KEY);
    if (saved) {
      setNickname(saved);
    } else {
      const newNickname = generateRandomNickname();
      setNickname(newNickname);
      localStorage.setItem(NICKNAME_STORAGE_KEY, newNickname);
    }
  }, []);

  /**
   * ニックネーム再生成
   */
  const regenerateNickname = () => {
    const newNickname = generateRandomNickname();
    setNickname(newNickname);
    localStorage.setItem(NICKNAME_STORAGE_KEY, newNickname);
  };

  return {
    nickname,
    regenerateNickname,
  };
}
