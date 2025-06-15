'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="text-xl font-bold text-[#FD484F]">LegalTendr</span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium hover:text-[#FD484F]">Home</Link>
          <Link href="/about" className="text-sm font-medium hover:text-[#FD484F]">About Us</Link>
          <Link href="/blog" className="text-sm font-medium hover:text-[#FD484F]">Blog</Link>
          <Link href="/faq" className="text-sm font-medium hover:text-[#FD484F]">FAQ</Link>
          <Link href="/app/discover" className="text-sm font-medium hover:text-[#FD484F]">Discover Lawyers</Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/onboarding" className="text-sm font-medium hover:text-[#FD484F]">Sign In</Link>
          <Button asChild className="bg-[#FD484F] text-white hover:bg-[#E13037] border-none">
            <Link href="/onboarding">Get Started</Link>
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </Button>
      </div>
    </header>
  );
}
