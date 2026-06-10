import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) { return clsx(inputs); }

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date(); const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getRarityLabel(rarity: string | null): string {
  const labels: Record<string, string> = {
    common: 'Common', uncommon: 'Uncommon', rare: 'Rare', super_rare: 'Super Rare',
    chase: 'Chase', treasure_hunt: 'Treasure Hunt', super_treasure_hunt: 'Super Treasure Hunt',
  };
  return rarity ? labels[rarity] || rarity : 'Unknown';
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    mint: 'Mint', near_mint: 'Near Mint', excellent: 'Excellent',
    good: 'Good', fair: 'Fair', poor: 'Poor',
  };
  return labels[condition] || condition;
}

export function getTimeRemaining(endTime: string | Date): {
  days: number; hours: number; minutes: number; seconds: number; total: number;
} {
  const total = Math.max(0, new Date(endTime).getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, total };
}
