export interface PoolCatalogEntry {
    id: string;
    lpName: string;
    token0Name: string;
    token1Name: string;
    token0Address: string;
    token1Address: string;
    isStable: boolean;
    decimals0: number;
    decimals1: number;
    reserve0: string;
    reserve1: string;
    lastUpdated: number;
    createdAt: number;
    blockHeight: number;
    totalSupplyBNStr: string;
} 