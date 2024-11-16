import { getReadonlyMiraAmm, getValue, setValue } from '@props-labs/duckscreener_lib';
import type { PoolMetadata } from 'mira-dex-ts';

export interface PoolCatalogEntry {
    id: string;               // pool_id
    token0Symbol: string;     // From SetSymbolEvent
    token1Symbol: string;     // From SetSymbolEvent
    token0Address: string;    // From pool_id
    token1Address: string;    // From pool_id
    isStable: boolean;        // From pool_id
    decimals0: number;        // From PoolMetadata
    decimals1: number;        // From PoolMetadata
    reserve0: string;         // From PoolMetadata
    reserve1: string;         // From PoolMetadata
    lastUpdated: number;      // Timestamp
    createdAt: number;        // From CreatePoolEvent
    blockHeight: number;      // From CreatePoolEvent
}

const POOL_CATALOG_KEY = 'pool_catalog';
const POOL_METADATA_TTL = 60 * 5; // 5 minutes

export async function updatePoolCatalog(poolId: string, blockHeight: number, timestamp: number): Promise<void> {
    try {
        // Get existing catalog
        const catalog = await getPoolCatalog();
        
        // Parse pool ID components
        const [token0Address, token1Address, isStableStr] = poolId.split('_');
        
        // Get pool metadata from Mira SDK
        const miraAmm = await getReadonlyMiraAmm();
        const metadata = await miraAmm.poolMetadata({
            token0: { bits: token0Address },
            token1: { bits: token1Address },
            isStable: isStableStr === 'true'
        });

        if (!metadata) {
            console.error(`Failed to get metadata for pool ${poolId}`);
            return;
        }

        // Get token symbols from events
        const symbols = await getTokenSymbols([token0Address, token1Address]);

        // Create or update catalog entry
        const entry: PoolCatalogEntry = {
            id: poolId,
            token0Symbol: symbols[token0Address] || 'Unknown',
            token1Symbol: symbols[token1Address] || 'Unknown',
            token0Address,
            token1Address,
            isStable: isStableStr === 'true',
            decimals0: metadata.decimals0,
            decimals1: metadata.decimals1,
            reserve0: metadata.reserve0.toString(),
            reserve1: metadata.reserve1.toString(),
            lastUpdated: Date.now(),
            createdAt: timestamp,
            blockHeight
        };

        catalog[poolId] = entry;
        
        // Save updated catalog
        await setValue(POOL_CATALOG_KEY, JSON.stringify(catalog));
        
        console.log(`Updated pool catalog for ${poolId}`);
    } catch (error) {
        console.error(`Error updating pool catalog for ${poolId}:`, error);
        throw error;
    }
}

async function getPoolCatalog(): Promise<Record<string, PoolCatalogEntry>> {
    const catalogStr = await getValue(POOL_CATALOG_KEY);
    return catalogStr ? JSON.parse(catalogStr) : {};
}

async function getTokenSymbols(addresses: string[]): Promise<Record<string, string>> {
    const query = `
        query GetTokenSymbols($addresses: [String!]) {
            MiraV1Core_SetSymbolEvent(
                where: { asset: { _in: $addresses } },
                distinct_on: asset
            ) {
                asset
                symbol
            }
        }
    `;

    try {
        const response = await queryDB(query, { addresses });
        const symbols: Record<string, string> = {};
        
        response.data.MiraV1Core_SetSymbolEvent.forEach((event: any) => {
            symbols[event.asset] = event.symbol;
        });
        
        return symbols;
    } catch (error) {
        console.error('Error fetching token symbols:', error);
        return {};
}
}

export async function updateAllPools(): Promise<void> {
    const query = `
        query GetAllPools {
            MiraV1Core_CreatePoolEvent(distinct_on: pool_id) {
                pool_id
                block_height
                time
            }
        }
    `;

    try {
        const response = await queryDB(query, {});
        const pools = response.data.MiraV1Core_CreatePoolEvent;

        console.log(`Syncing ${pools.length} existing pools...`);

        for (const pool of pools) {
            await updatePoolCatalog(
                pool.pool_id,
                pool.block_height,
                new Date(pool.time).getTime()
            );
        }

        console.log('Pool sync completed');
    } catch (error) {
        console.error('Error syncing pools:', error);
        throw error;
    }
} 