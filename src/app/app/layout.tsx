'use client';

import { BottomNav } from '@/components/layout/bottom-nav';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component for page transitions
function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading page...</p>
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  
  // Track pathname changes to detect navigation
  useEffect(() => {
    if (prevPathname && prevPathname !== pathname) {
      // Navigation completed
      setIsLoading(false);
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);
  
  // Handle navigation start
  const handleNavigation = (href: string) => {
    if (href !== pathname) {
      setIsLoading(true);
      router.push(href);
    }
  };
  
  return (
    <div className="flex">
      <SidebarNav />
      
      <div className="md:ml-64 flex-1 min-h-screen main-content">
        <div className="mobile-app-container md:container md:max-w-none md:mx-0 md:px-8">
          <main className="flex-1 overflow-y-auto scrollbar-container pb-24 md:pb-8 pt-2 md:pt-5 min-h-[calc(100vh-80px)]">
            {isLoading && <PageLoader />}
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
            {/* Extra space to prevent dock overlap */}
            <div className="h-16 md:h-0"></div>
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
