'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { navItems, type NavItem } from '../../lib/nav-items';
import type { LucideIcon } from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 fixed left-0 top-0">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xl font-bold text-[#FD484F]">LegalTendr</span>
      </div>
      <div className="flex flex-col gap-2 p-5">
        {navItems.map((item: NavItem) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-700 text-[#FD484F]'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-[#FD484F]' : 'text-gray-500 dark:text-gray-400'
                }`}
                fill={isActive ? 'currentColor' : 'none'}
                stroke={isActive ? 'currentColor' : 'currentColor'}
                strokeWidth={isActive ? 1.5 : 2}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
