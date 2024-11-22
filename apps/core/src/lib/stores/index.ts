import { writable } from 'svelte/store';
import type { PoolCatalogEntry } from '$lib/types';
import { browser } from '$app/environment';

// Create a custom store for selectedPool that syncs with localStorage
// export function createSelectedPoolStore() {
//     // Get initial value from localStorage if available
//     const storedPool = browser ? localStorage.getItem('selectedPool') : null;
//     const initialValue = storedPool ? JSON.parse(storedPool) : null;
    
//     const { subscribe, set } = writable<PoolCatalogEntry | undefined>(initialValue);

//     return {
//         subscribe,
//         set: (value: PoolCatalogEntry | undefined) => {
//             // Save to localStorage when value changes
//             if (browser && value) {
//                 localStorage.setItem('selectedPool', JSON.stringify(value));
//             }
//             set(value);
//         }
//     };
// }

export const selectedPool = writable<any>(undefined);
export const allPairs = writable<PoolCatalogEntry[]>([]);
export const allNativeAssets = writable<any[]>([]);
export const selectedPrimaryToken = writable<any>(undefined);
export const selectedCounterPartyToken = writable<any>(undefined);
export const ethPrice = writable<any>(undefined);
export const usdtPrice = writable<any>(undefined);
export const usdcPrice = writable<any>(undefined);
export const usdePrice = writable<any>(undefined);
export const daiPrice = writable<any>(undefined);
export const showWalletModal = writable(false);
export const allPools = writable<PoolCatalogEntry[]>([]);