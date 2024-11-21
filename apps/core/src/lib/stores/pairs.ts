import { writable } from 'svelte/store';
import type { TradingPair } from '$lib/services/pairs';

export const pairs = writable<TradingPair[]>([]);
export const selectedPair = writable<TradingPair | null>(null);
export const searchQuery = writable<string>('');

export async function fetchPairs() {
    try {
        const response = await fetch('/api/pairs');
        const data = await response.json();
        console.log('fetchPairs()',data);
        if (response.ok) {
            pairs.set(data);
            return data;
        } else {
            throw new Error(data.error || 'Failed to fetch pairs');
        }
    } catch (error) {
        console.error('Error fetching pairs:', error);
        throw error;
    }
}

// Filter function that can be used by components
export function filterPairs(pairs: TradingPair[], query: string): TradingPair[] {
    const searchLower = query.toLowerCase();
    return pairs.filter(pair => 
        pair.token0Symbol.toLowerCase().includes(searchLower) ||
        pair.token1Symbol.toLowerCase().includes(searchLower) ||
        pair.token0Address.toLowerCase().includes(searchLower) ||
        pair.token1Address.toLowerCase().includes(searchLower)
    );
} 