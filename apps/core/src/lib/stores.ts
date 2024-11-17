import { writable } from 'svelte/store';
import type { PoolCatalogEntry } from '$lib/types';

export const selectedPool = writable<PoolCatalogEntry | undefined>();
export const allPairs = writable<PoolCatalogEntry[]>([]);
export const ethPrice = writable<number>(0);
export const showWalletModal = writable(false);
export const allPools = writable<PoolCatalogEntry[]>([]);