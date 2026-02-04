"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Card } from "@/components/ui/card";
import { Category } from "@/types";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/constants/ja";
import { getCategoryIcon } from "@/features/posts/PostCard";

export default function CategoriesPage() {
  const router = useRouter();

  // カテゴリーリスト（"すべて"を除く）
  const categoryList = Object.values(CATEGORIES).filter(
    (cat) => cat !== CATEGORIES.ALL
  ) as Category[];

  const handleCategoryClick = (category: Category) => {
    router.push(`/category/${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* ページタイトル */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            カテゴリー一覧
          </h1>
          <p className="text-sm text-gray-600">
            気になるカテゴリーを選んで投稿を探しましょう
          </p>
        </div>

        {/* カテゴリーグリッド (2列) */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {categoryList.map((category) => {
            const CategoryIcon = getCategoryIcon(category);
            const colorClass = CATEGORY_COLORS[category];

            return (
              <Card
                key={category}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${colorClass}`}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
                  <CategoryIcon className="w-10 h-10 mb-3" />
                  <span className="text-sm font-medium leading-tight">
                    {category}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* すべて表示カード */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 bg-gray-50 text-gray-800 border-gray-300"
          onClick={() => router.push("/")}
        >
          <div className="p-5 flex items-center justify-center">
            <span className="text-base font-medium">
              すべてのカテゴリーを表示
            </span>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
