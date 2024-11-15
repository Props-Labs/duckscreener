import { bn } from "fuels";
import type { WalletUnlocked } from "fuels";
import { env } from "$env/dynamic/public";
import { getReadonlyMiraAmm } from './swap';

export async function getBalance(wallet: WalletUnlocked, token: 'ETH' | 'PSYCHO'): Promise<string> {
    try {
        if (token === 'ETH') {
            const balance = await wallet.getBalance();
            return (Number(balance) / 1e9).toString(); // ETH uses 9 decimals on Fuel
        } else {
            // For PSYCHO token, we need to get the balance using the correct asset ID
            const miraAmm = await getReadonlyMiraAmm();
            const pool = await miraAmm.poolMetadata(env.PUBLIC_POOL_ID);
            if (!pool) throw new Error('Pool not found');
            
            // Get the correct asset ID from the pool metadata
            const psychoAssetId = pool.poolId[0]; // PSYCHO is always asset0 in the pool
            const balance = await wallet.getBalance(psychoAssetId);
            return (Number(balance) / 1e9).toString(); // PSYCHO uses 9 decimals
        }
    } catch (error) {
        console.error(`Error getting ${token} balance:`, error);
        return '0.00';
    }
} 