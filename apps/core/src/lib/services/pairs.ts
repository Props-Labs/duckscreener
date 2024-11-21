import type { PoolMetadata } from 'mira-dex-ts';
import { getReadonlyMiraAmm } from './swap';
import { createPoolId } from './swap';

export type TradingPair = {
    id: string;               // Unique identifier (poolId)
    token0Symbol: string;     // e.g., "ETH"
    token1Symbol: string;     // e.g., "PSYCHO"
    token0Address: string;    // Contract address
    token1Address: string;    // Contract address
    isStable: boolean;
    reserve0: string;
    reserve1: string;
    decimals0: number;
    decimals1: number;
    volume24h?: string;       // Optional volume data
    tvl?: string;            // Optional TVL data
};

// Validate pool exists and get metadata
export async function validateAndGetPoolMetadata(poolId: string): Promise<PoolMetadata | null> {
    const miraAmm = await getReadonlyMiraAmm();
    const poolIdObj = createPoolId(poolId);
    return await miraAmm.poolMetadata(poolIdObj);
} 