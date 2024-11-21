import { env } from "$env/dynamic/public";
import type { MiraAmm, ReadonlyMiraAmm, PoolId } from "mira-dex-ts";
import { Account, Provider, WalletUnlocked, bn } from "fuels";
import type { AssetId } from "fuels";

// Dynamically import mira-dex-ts to avoid SSR issues
const getMiraDex = async () => {
    const { MiraAmm, ReadonlyMiraAmm } = await import('mira-dex-ts');
    return { MiraAmm, ReadonlyMiraAmm };
};

const provider = await Provider.create(env.PUBLIC_FUEL_RPC_URL);

let readonlyMiraAmm: ReadonlyMiraAmm;
let miraAmm: MiraAmm;

export async function getReadonlyMiraAmm() {
    if (!readonlyMiraAmm) {
        const { ReadonlyMiraAmm } = await getMiraDex();
        readonlyMiraAmm = new ReadonlyMiraAmm(provider);
    }
    return readonlyMiraAmm;
}

async function getMiraAmm(wallet: WalletUnlocked) {
    const { MiraAmm } = await getMiraDex();
    return new MiraAmm(wallet);
}

function parseAmount(amount: string | number, decimals: number): bigint {
    try {
        // Remove commas and convert to string
        const amountStr = amount.toString().replace(/,/g, '');
        const num = Number(amountStr);
        if (isNaN(num)) throw new Error('Invalid number');
        
        // Convert to integer representation with proper decimals
        // Use string manipulation to avoid floating point precision issues
        const [whole, fraction = ''] = amountStr.split('.');
        const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
        const combinedStr = `${whole}${paddedFraction}`;
        
        // Remove leading zeros to avoid invalid octal literals
        const cleanedStr = combinedStr.replace(/^0+/, '') || '0';
        const scaledAmount = BigInt(cleanedStr);
        
        // Validate u64 range
        const MAX_U64 = BigInt('18446744073709551615'); // 2^64 - 1
        if (scaledAmount < 0n || scaledAmount > MAX_U64) {
            throw new Error(`Amount exceeds maximum allowed value`);
        }
        
        return scaledAmount;
    } catch (error) {
        console.error('Error parsing amount:', error, {
            amount,
            decimals,
            originalValue: amount.toString()
        });
        throw error;
    }
}

// Helper to create pool ID from string
export function createPoolId(poolIdString: string, swapOrder: boolean = false): PoolId {
    console.log('createPoolId', poolIdString)
    const [asset0, asset1, isStable] = poolIdString.split('_');
    // If swapOrder is true, swap the assets
    return swapOrder ? [
        { bits: asset1 } as AssetId,
        { bits: asset0 } as AssetId,
        isStable === 'true'
    ] : [
        { bits: asset0 } as AssetId,
        { bits: asset1 } as AssetId,
        isStable === 'true'
    ];
}

export async function previewSwap(
    amountIn: string,
    pools: PoolId[],
    isEthInput: boolean
): Promise<string> {
    const miraAmm = await getReadonlyMiraAmm();
    
    // Get pool metadata to check reserves
    const pool = await miraAmm.poolMetadata(pools[0]);
    if (!pool) throw new Error('Pool not found');
    
    try {
        console.log('Pool Metadata:', {
            reserve0: pool.reserve0.toString(),
            reserve1: pool.reserve1.toString(),
            decimals0: pool.decimals0,
            decimals1: pool.decimals1,
            poolId: pool.poolId,
            isStable: pools[0][2]
        });

        // Use decimals from pool metadata
        const inputDecimals = isEthInput ? pool.decimals1 : pool.decimals0;
        const amountInBN = parseAmount(amountIn, inputDecimals);

        // For ETH input (buying PSYCHO), use asset1 as input asset
        // For PSYCHO input (selling PSYCHO), use asset0 as input asset
        const expectedAmount = await miraAmm.previewSwapExactInput(
            isEthInput ? pools[0][1] : pools[0][0],
            amountInBN,
            pools
        );
        
        console.log('Raw preview response:', expectedAmount);
        
        if (Array.isArray(expectedAmount) && expectedAmount.length === 2) {
            const amount = expectedAmount[1];
            
            if (amount && typeof amount === 'object' && 'words' in amount) {
                // Convert BN to string first to avoid precision loss
                const bnStr = amount.toString();
                const value = BigInt(bnStr);
                
                // Use decimals from pool metadata based on which token we're getting out
                const outputDecimals = isEthInput ? pool.decimals0 : pool.decimals1;
                
                // Convert to decimal string with proper precision
                const divisor = BigInt(10) ** BigInt(outputDecimals);
                const wholePart = value / divisor;
                const fracPart = value % divisor;
                const fracStr = fracPart.toString().padStart(outputDecimals, '0');
                
                // Trim trailing zeros from fractional part
                const trimmedFracStr = fracStr.replace(/0+$/, '');
                const result = trimmedFracStr ? `${wholePart}.${trimmedFracStr}` : wholePart.toString();
                
                console.log('Final calculation:', {
                    rawValue: value.toString(),
                    outputDecimals,
                    wholePart: wholePart.toString(),
                    fracPart: fracPart.toString(),
                    result,
                    isEthInput
                });
                
                return result;
            }
        }

        throw new Error(`Unexpected response format: ${JSON.stringify(expectedAmount)}`);
    } catch (error) {
        console.error('Error previewing swap:', error);
        throw error;
    }
}

export async function executeSwap(
    wallet: WalletUnlocked,
    amountIn: string,
    amountOutMin: string,
    pools: PoolId[],
    isEthInput: boolean,
    deadline: number = Math.floor(Date.now() / 1000) + 1200
) {
    const [readonlyMiraAmm, miraAmm] = await Promise.all([
        getReadonlyMiraAmm(),
        getMiraAmm(wallet)
    ]);
    
    const pool = await readonlyMiraAmm.poolMetadata(pools[0]);
    if (!pool) throw new Error('Pool not found');
    
    const inputDecimals = isEthInput ? pool.decimals1 : pool.decimals0;
    const outputDecimals = isEthInput ? pool.decimals0 : pool.decimals1;
    
    try {
        // Add input validation
        if (Number(amountIn) <= 0) throw new Error('Input amount must be greater than 0');
        if (Number(amountOutMin) <= 0) throw new Error('Minimum output amount must be greater than 0');
        
        const amountInBN = parseAmount(amountIn, inputDecimals);
        const amountOutMinBN = parseAmount(amountOutMin, outputDecimals);
        
        console.log('Swap parameters:', {
            rawAmountIn: amountIn,
            rawAmountOutMin: amountOutMin,
            amountIn: amountInBN.toString(),
            amountOutMin: amountOutMinBN.toString(),
            inputDecimals,
            outputDecimals,
            isEthInput,
            poolReserves: {
                reserve0: pool.reserve0.toString(),
                reserve1: pool.reserve1.toString()
            }
        });

        // Update transaction parameters to match TxParams type
        const txParams = {
            gasLimit: 1_000_000,
            maxFee: 2500,
            variableOutputs: 2,
            witnessLimit: 10_000
        };

        // Get the transaction request from the SDK
        const txRequest = await miraAmm.swapExactInput(
            amountInBN,
            isEthInput ? pools[0][1] : pools[0][0], // assetIn
            amountOutMinBN,
            pools,
            deadline,
            txParams
        );
        
        // Send the transaction request to the wallet for signing and execution
        const response = await wallet.sendTransaction(txRequest);
        
        // Wait for transaction to be mined
        const result = await response.wait();
        
        return result;
    } catch (error) {
        console.error('Error executing swap:', error);
        if (error instanceof Error) {
            throw new Error(`Swap failed: ${error.message}`);
        }
        throw error;
    }
} 