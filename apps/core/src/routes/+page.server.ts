import type { PageServerLoad } from './$types';
import { getValue } from '$lib/services/redis';
import type { PoolCatalogEntry } from '$lib/types';

export const load: PageServerLoad = async () => {
    try {
        // Get all pool IDs
        const poolIdsStr = await getValue('pool_ids');
        if (!poolIdsStr) {
            return { pools: [] };
        }

        const poolIds = JSON.parse(poolIdsStr);
        const pools: PoolCatalogEntry[] = [];

        // Get all pools in parallel
        const poolPromises = poolIds.map(async (poolId: string) => {
            const poolStr = await getValue(`pool:${poolId}`);
            if (!poolStr) return null;
            return JSON.parse(poolStr) as PoolCatalogEntry;
        });

        const results = await Promise.all(poolPromises);
        
        // Filter out any null results and sort by creation date (newest first)
        const validPools = results
            .filter((pool): pool is PoolCatalogEntry => pool !== null)
            //.filter(pool => pool.token1Name === 'ETH' )
            .sort((a, b) => b.createdAt - a.createdAt);

        console.log('validPools', validPools);
        return {
            pools: validPools
        };
    } catch (error) {
        console.error('Error loading pools:', error);
        return {
            pools: []
        };
    }
};