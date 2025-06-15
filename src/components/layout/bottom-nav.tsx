'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { navItems } from '@/lib/nav-items';

// Custom event names
export const HIDE_BOTTOM_NAV = 'hide-bottom-nav';
export const SHOW_BOTTOM_NAV = 'show-bottom-nav';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  
  // Listen for custom events to show/hide the bottom nav
  useEffect(() => {
    const handleHideNav = () => setIsVisible(false);
    const handleShowNav = () => setIsVisible(true);
    
    window.addEventListener(HIDE_BOTTOM_NAV, handleHideNav);
    window.addEventListener(SHOW_BOTTOM_NAV, handleShowNav);
    
    return () => {
      window.removeEventListener(HIDE_BOTTOM_NAV, handleHideNav);
      window.removeEventListener(SHOW_BOTTOM_NAV, handleShowNav);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-auto h-16 bg-white shadow-lg rounded-full dark:bg-gray-800 px-2 transition-all duration-300 ease-in-out">
      <div className="flex h-full items-center justify-center space-x-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center justify-center text-2xl rounded-full p-2 transition-colors ${pathname.includes(item.href) ? 'text-[#FD484F] bg-[#FD484F]/10' : 'hover:text-[#FD484F] hover:bg-[#FD484F]/10'}`}
              title={item.label}
            >
              <item.icon
                className={`w-6 h-6 transition-colors duration-200 ${
                  isActive
                    ? 'text-[#FD484F] fill-[#FD484F]'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                fill={isActive ? 'currentColor' : 'none'}
                stroke={isActive ? 'currentColor' : 'currentColor'}
                strokeWidth={isActive ? 1.5 : 2}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
