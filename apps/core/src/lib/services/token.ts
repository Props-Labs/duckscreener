import { bn } from "fuels";
import type { WalletUnlocked, AssetId } from "fuels";
import { getReadonlyMiraAmm, createPoolId } from './swap';
import type { PoolCatalogEntry } from "$lib/types";

export async function getBalances(
    wallet: WalletUnlocked, 
    pool: PoolCatalogEntry
): Promise<any[]> {
    try {
        const miraAmm = await getReadonlyMiraAmm();
        const formattedPoolId = createPoolId(pool.id);
        const poolMetadata = await miraAmm.poolMetadata(formattedPoolId);
        console.log("getBalances poolMetadata", poolMetadata)
        let balances = [];
        for(let i = 0; i <=1; i++) {
            let formattedBalance;
            const assetId = poolMetadata.poolId[i].bits;
            //@ts-ignore
            if(pool[`token${i}Name`] === 'ETH'){
                const balance = await wallet.getBalance();
                console.log('balance', balance);
                formattedBalance = balance.format();
                console.log('formattedBalance', formattedBalance);
                
            }
            else {
                
                console.log('getBalance', pool)
                
                console.log('formattedPoolId', formattedPoolId);
                
                if (!poolMetadata) throw new Error('Pool not found');
                
                
                const balance = await wallet.getBalance(assetId);
                
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
                
                formattedBalance = trimmedFracStr ? `${wholePart}.${trimmedFracStr}` : wholePart.toString();

            }
            balances.push({assetId, balance: formattedBalance});
        }
        return balances;
        
    } catch (error) {
        console.error(`Error getting balance:`, error);
        return ['0.00', '0.00'];
    }
} 