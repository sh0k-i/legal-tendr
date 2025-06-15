import { Home, Search, Briefcase, MessageSquare, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: Home,
  },
  {
    label: 'Discover',
    href: '/app/discover',
    icon: Search,
  },
  {
    label: 'My Cases',
    href: '/app/my-cases',
    icon: Briefcase,
  },
  {
    label: 'Messages',
    href: '/app/messages',
    icon: MessageSquare,
  },
  {
    label: 'Account',
    href: '/app/account',
    icon: User,
  },
];
