"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center">
          <Link 
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src="/logo.png"
              alt="Honne Logo"
              width="35"
              height="35"
              className="object-contain"
            />
          </Link>
        </div>
        
        <nav className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="inline-flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50"
          >
            <Search className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </header>
  );
}
