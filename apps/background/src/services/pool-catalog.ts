import { getValue, storeValue, deleteValue } from './redis';
import { queryDB } from './data';
import type { PoolMetadata, PoolId } from 'mira-dex-ts';
import { getReadonlyMiraAmm, getPoolMetadata, getLPAssetInfo } from "./dex";
import type {AssetId} from "fuels";


export interface PoolCatalogEntry {
    id: string;               // pool_id
    lpName: string;           // From lpInfo
    token0Name: string;     // From lpInfo
    token1Name: string;     // From lpInfo
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
    totalSupplyBNStr: string;      // From PoolMetadata
}

const POOL_KEY_PREFIX = 'pool:';
const POOL_IDS_KEY = 'pool_ids';
const POOL_METADATA_TTL = 60 * 60 * 24 * 365 * 10; //

function getPoolKey(poolId: string): string {
    return `${POOL_KEY_PREFIX}${poolId}`;
}

export async function updatePoolCatalog(pool: any): Promise<void> {
    console.log('Updating pool catalog for', pool);
    try {
        // Parse pool ID components
        const [token0Address, token1Address, isStableStr] = pool.pool_id.split('_');
        
        // Get pool metadata from Mira SDK
        const metadata = await getPoolMetadata(`${token0Address}_${token1Address}_${isStableStr === 'true'}`);

        console.log('metadata', metadata);
        if (!metadata) {
            console.error(`Failed to get metadata for pool ${pool.pool_id}`);
            return;
        }

        // Get token addresses from metadata
        const token0 = metadata.poolId?.[0].bits;
        const token1 = metadata.poolId?.[1].bits;

        const assetId: AssetId ={ bits: metadata.liquidity?.[0].bits }

        if (!token0 || !token1) {
            console.error(`Invalid token addresses for pool ${pool.pool_id}`);
            return;
        }

        const lpInfo = await getLPAssetInfo(assetId);
        console.log('lpInfo::', lpInfo);

        // Get token symbols from events using the correct addresses
        // const symbols = await getTokenSymbols([token0, token1]);

        const lpName = lpInfo?.name;
        const lpNameParts = lpName?.split('-');
        const token0Name = lpNameParts?.[0];
        const token1Name = lpNameParts?.[1].split(' ')[0];

        // Create or update catalog entry
        const entry: PoolCatalogEntry = {
            id: pool.pool_id,
            lpName,
            token0Name,
            token1Name,
            token0Address: token0,
            token1Address: token1,
            isStable: isStableStr === 'true',
            decimals0: metadata.decimals0 || 0,
            decimals1: metadata.decimals1 || 0,
            reserve0: metadata.reserve0.toString(),
            reserve1: metadata.reserve1.toString(),
            lastUpdated: Date.now(),
            createdAt: new Date(pool.time).getTime(),
            blockHeight: pool.block_height,
            totalSupplyBNStr: lpInfo?.totalSupply?.toString() || ''
        };

        // Store the pool entry
        await storeValue(getPoolKey(pool.pool_id), JSON.stringify(entry), POOL_METADATA_TTL);
        
        // Add pool ID to the set of all pool IDs if it's not there
        const poolIds = await getPoolIds();
        if (!poolIds.includes(pool.pool_id)) {
            poolIds.push(pool.pool_id);
            await storeValue(POOL_IDS_KEY, JSON.stringify(poolIds), POOL_METADATA_TTL);
        }
        
        console.log(`Updated pool catalog for ${pool.pool_id}`);
    } catch (error) {
        console.error(`Error updating pool catalog for ${pool.pool_id}:`, error);
        throw error;
    }
}

async function getPoolIds(): Promise<string[]> {
    const idsStr = await getValue(POOL_IDS_KEY);
    return idsStr ? JSON.parse(idsStr) : [];
}

export async function getPool(poolId: string): Promise<PoolCatalogEntry | null> {
    const poolStr = await getValue(getPoolKey(poolId));
    return poolStr ? JSON.parse(poolStr) : null;
}

export async function getAllPools(): Promise<PoolCatalogEntry[]> {
    const poolIds = await getPoolIds();
    const pools = await Promise.all(
        poolIds.map(async (id) => await getPool(id))
    );
    return pools.filter((pool): pool is PoolCatalogEntry => pool !== null);
}

async function getTokenSymbols(addresses: string[]): Promise<Record<string, string>> {
    const query = `
        query GetTokenSymbols($addresses: [String!]!) {
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
        
        if (response?.data?.MiraV1Core_SetSymbolEvent) {
            response.data.MiraV1Core_SetSymbolEvent.forEach((event: any) => {
                symbols[event.asset] = event.symbol;
            });
        }
        
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
        const pools = response?.data?.MiraV1Core_CreatePoolEvent || [];

        console.log(`Syncing ${pools.length} existing pools...`);

        for (const pool of pools) {
            await updatePoolCatalog(pool);
        }

        console.log('Pool sync completed');
    } catch (error) {
        console.error('Error syncing pools:', error);
        throw error;
    }
} 