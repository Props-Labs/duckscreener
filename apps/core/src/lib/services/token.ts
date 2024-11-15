import { bn } from "fuels";
import type { WalletUnlocked, AssetId } from "fuels";
import { getReadonlyMiraAmm, createPoolId } from './swap';

export async function getBalance(
    wallet: WalletUnlocked, 
    token: 'ETH' | 'PSYCHO',
    poolId: string
): Promise<string> {
    try {
        if (token === 'ETH') {
            const balance = await wallet.getBalance();
            console.log('balance', balance);
            const formattedBalance = balance.format();
            console.log('formattedBalance', formattedBalance);
            return formattedBalance;
        } else {
            const miraAmm = await getReadonlyMiraAmm();
            const formattedPoolId = createPoolId(poolId);
            const pool = await miraAmm.poolMetadata(formattedPoolId);
            if (!pool) throw new Error('Pool not found');
            
            const psychoAssetId = pool.poolId[0].bits;
            const balance = await wallet.getBalance(psychoAssetId);
            
            // Use toString() directly on BN to handle large numbers
            const rawValue = balance.toString();
            const value = BigInt(rawValue);
            const divisor = BigInt(1e9); // PSYCHO uses 9 decimals
            
            // Calculate whole and fractional parts
            const wholePart = value / divisor;
            const fracPart = value % divisor;
            
            // Pad fraction with leading zeros and trim trailing zeros
            const fracStr = fracPart.toString().padStart(9, '0');
            const trimmedFracStr = fracStr.replace(/0+$/, '');
            
            return trimmedFracStr ? `${wholePart}.${trimmedFracStr}` : wholePart.toString();
        }
    } catch (error) {
        console.error(`Error getting ${token} balance:`, error);
        return '0.00';
    }
} 