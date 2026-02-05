import { useState } from "react";
import { useRouter } from "next/navigation";
import { Post, Category } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Coins, 
  Scale, 
  Gift, 
  Briefcase, 
  Users, 
  Shield, 
  Clock, 
  Brain,
  LucideIcon
} from "lucide-react";
import { LABELS, CATEGORY_COLORS } from "@/lib/constants/ja";
import { useCommentCount } from "./hooks/useComments";
import { useLike } from "./hooks/useLike";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthModal } from "@/features/auth/components/AuthModal";

interface PostCardProps {
  post: Post;
}

/**
 * カテゴリー別アイコン取得 (Export for reuse)
 */
export const getCategoryIcon = (category: Category): LucideIcon => {
  const iconMap: Record<Category, LucideIcon> = {
    "年収・手取り": Coins,
    "ホワイト・ブラック判定": Scale,
    "ボーナス報告": Gift,
    "転職のホンネ": Briefcase,
    "人間関係・上司": Users,
    "社内政治・派閥": Shield,
    "サービス残業・待遇": Clock,
    "福利厚生・環境": Heart,
    "メンタル・悩み": Brain,
    "つぶやき": MessageCircle,
  };
  return iconMap[category] || MessageCircle;
};

/**
 * カテゴリー別カラー取得
 */
const getCategoryColor = (category: Category): string => {
  return CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800 border-gray-200";
};

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const CategoryIcon = getCategoryIcon(post.category);
  const { count: commentCount } = useCommentCount(post.id);
  const { likesCount, isLiked, toggleLike } = useLike(
    post.id,
    post.likes_count || 0,
    user?.id
  );
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCardClick = () => {
    router.push(`/posts/${post.id}`);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // カードクリックを防ぐ
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    await toggleLike();
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - posted.getTime()) / 60000);
    
    if (diffInMinutes < 1) return LABELS.JUST_NOW;
    if (diffInMinutes < 60) return `${diffInMinutes}${LABELS.MINUTES_AGO}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}${LABELS.HOURS_AGO}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}${LABELS.DAYS_AGO}`;
  };

  return (
    <>
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-medium">
              {post.nickname.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{post.nickname}</span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(post.created_at)}
              </span>
            </div>
          </div>
          <Badge className={`${getCategoryColor(post.category)} flex items-center gap-1`}>
            <CategoryIcon className="w-3 h-3" />
            <span className="text-xs">{post.category}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {/* 画像表示 */}
        {post.image_url && (
          <div className="mt-3">
            <img
              src={post.image_url}
              alt="投稿画像"
              className="w-full h-auto max-h-96 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-4 pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          onClick={handleLikeClick}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isLiked 
                ? "fill-red-500 text-red-500" 
                : "text-gray-600"
            }`}
          />
          <span className={`text-sm ${isLiked ? "text-red-500 font-medium" : ""}`}>
            {likesCount}
          </span>
          <span className="text-xs text-muted-foreground">{LABELS.LIKES}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{commentCount}</span>
          <span className="text-xs text-muted-foreground">{LABELS.COMMENT}</span>
        </Button>
      </CardFooter>
    </Card>
    {showAuthModal && (
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    )}
    </>
  );
}
