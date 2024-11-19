import { writable } from 'svelte/store';
import type { PoolCatalogEntry } from '$lib/types';
import { browser } from '$app/environment';

// Create a custom store for selectedPool that syncs with localStorage
function createSelectedPoolStore() {
    // Get initial value from localStorage if available
    const storedPool = browser ? localStorage.getItem('selectedPool') : null;
    const initialValue = storedPool ? JSON.parse(storedPool) : null;
    
    const { subscribe, set } = writable<PoolCatalogEntry | undefined>(initialValue);

    return {
        subscribe,
        set: (value: PoolCatalogEntry | undefined) => {
            // Save to localStorage when value changes
            if (browser && value) {
                localStorage.setItem('selectedPool', JSON.stringify(value));
            }
            set(value);
        }
    };
}

export const selectedPool = createSelectedPoolStore();
export const allPairs = writable<PoolCatalogEntry[]>([]);
export const ethPrice = writable<any>();
export const usdtPrice = writable<any>();
export const usdcPrice = writable<any>();
export const usdePrice = writable<any>();
export const daiPrice = writable<any>();
export const showWalletModal = writable(false);
export const allPools = writable<PoolCatalogEntry[]>([]);