# 本音 (Honne)

社会人のための匿名コミュニティプラットフォーム。悩み、愚痴、質問を安心して共有できる場所です。

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Backend:** Supabase
- **Icons:** Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # Atomic UI components (Shadcn)
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── header.tsx
├── features/              # Feature-specific components
│   └── posts/
│       └── PostCard.tsx
├── lib/                   # Shared library configs
│   ├── utils.ts          # Utility functions
│   └── supabase.ts       # Supabase client
└── types/                 # TypeScript interfaces
    └── index.ts          # Global type definitions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd honne
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Database Schema (Supabase)

### Posts Table
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- '인간관계', '급여', '블랙기업', '커리어', '직장생활' 등
  nickname TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes (Optional but Recommended)
```sql
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_category_idx ON posts(category);
CREATE INDEX comments_post_id_idx ON comments(post_id);
```

## 🎨 Design Philosophy

- **Mobile-first:** Optimized for smartphone usage
- **Japanese minimalism:** Clean, simple, and elegant UI
- **Anonymous-friendly:** Focus on content, not identity
- **Empathy-driven:** Encourage supportive interactions

## 📝 Features

- ✅ View posts by category (悩み, 愚痴, 質問, 雑談)
- ✅ Mobile-responsive design
- ✅ Japanese language interface
- 🚧 Create new posts (coming soon)
- 🚧 Comment on posts (coming soon)
- 🚧 Empathy reactions (coming soon)
- 🚧 User authentication (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License
