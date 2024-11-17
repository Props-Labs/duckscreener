import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getValue } from '$lib/services/redis';

export const GET: RequestHandler = async ({ url }) => {
    const searchTerm = url.searchParams.get('q')?.toLowerCase() || '';
    
    if (!searchTerm) {
        return json([]);
    }

    try {
        // Get all pool IDs
        const poolIdsStr = await getValue('pool_ids');
        if (!poolIdsStr) {
            return json([]);
        }

        const poolIds = JSON.parse(poolIdsStr);
        const results = [];

        // Search through pools
        for (const poolId of poolIds) {
            const poolStr = await getValue(`pool:${poolId}`);
            if (!poolStr) continue;

            const pool = JSON.parse(poolStr);
            
            // Search in token names and LP name
            if (
                pool.token0Name?.toLowerCase().includes(searchTerm) ||
                pool.token1Name?.toLowerCase().includes(searchTerm) ||
                pool.lpName?.toLowerCase().includes(searchTerm)
            ) {
                results.push(pool);
            }

            // Limit results to prevent too large responses
            if (results.length >= 10) break;
        }

        return json(results);
    } catch (error) {
        console.error('Search error:', error);
        return json({ error: 'Search failed' }, { status: 500 });
    }
}; 