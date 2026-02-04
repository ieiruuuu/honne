"use client";

import { Search } from "lucide-react";
import { LABELS } from "@/lib/constants/ja";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoImage from "@/logo.png";

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
            <Image 
              src={LogoImage}
              alt="Honne Logo"
              height={35}
              width={35}
              className="object-contain"
              priority
            />
          </Link>
        </div>
        
        <nav className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push("/search")}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">{LABELS.SEARCH}</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
