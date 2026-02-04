"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Category } from "@/types";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants/ja";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/features/posts/PostCard";

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryDrawer({ isOpen, onClose }: CategoryDrawerProps) {
  const router = useRouter();

  if (!isOpen) return null;

  // カテゴリーリスト（"すべて"を除く）
  const categoryList = Object.values(CATEGORIES).filter(
    (cat) => cat !== CATEGORIES.ALL
  ) as Category[];

  const handleCategoryClick = (category: Category) => {
    onClose();
    // カテゴリーページに遷移
    router.push(`/category/${encodeURIComponent(category)}`);
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* ドロワー */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-hidden">
        <div className="container mx-auto max-w-2xl">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              カテゴリー選択
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* カテゴリーグリッド */}
          <div className="px-4 py-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            <div className="grid grid-cols-2 gap-3">
              {categoryList.map((category) => {
                const CategoryIcon = getCategoryIcon(category);
                const colorClass = CATEGORY_COLORS[category];

                return (
                  <Card
                    key={category}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${colorClass}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="p-4 flex flex-col items-center justify-center text-center min-h-[100px]">
                      <CategoryIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium leading-tight">
                        {category}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* すべてのカテゴリー */}
            <Card
              className="mt-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 bg-gray-100 text-gray-800 border-gray-200"
              onClick={() => {
                onClose();
                router.push("/");
              }}
            >
              <div className="p-4 flex items-center justify-center">
                <span className="text-sm font-medium">
                  すべてのカテゴリー
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
