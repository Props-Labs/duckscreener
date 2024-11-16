import 'dotenv/config';
import type {MiraAmm, PoolId} from "mira-dex-ts";
import {ReadonlyMiraAmm} from "mira-dex-ts";
import {Account, Provider} from "fuels";
import type {AssetId} from "fuels";

// Initialize provider and readonlyMiraAmm lazily
let provider: Provider;
let readonlyMiraAmm: ReadonlyMiraAmm;

async function initializeProvider() {
    if (!provider) {
        provider = await Provider.create(process.env.PUBLIC_FUEL_RPC_URL);
    }
    return provider;
}

export async function getReadonlyMiraAmm() {
    if (!readonlyMiraAmm) {
        const provider = await initializeProvider();
        readonlyMiraAmm = new ReadonlyMiraAmm(provider);
    }
    return readonlyMiraAmm;
}

export async function getTotalAssets() {
    const miraAmm = await getReadonlyMiraAmm();
    const totalAssets = await miraAmm.totalAssets();
    return totalAssets;
}

export async function getLPAssetInfo(poolId: PoolId) {
    const miraAmm = await getReadonlyMiraAmm();
    const assetInfo = await miraAmm.lpAssetInfo(poolId);
    return assetInfo;
}

export async function getPoolMetadata(pool_id: any) {
    console.log('getPoolMetadata', pool_id);
    const poolIdparts = pool_id.split('_');
    const miraAmm = await getReadonlyMiraAmm();

    console.log('poolIdparts', poolIdparts);

    const poolId: PoolId = [
        {bits: poolIdparts[0]} as AssetId,
        {bits: poolIdparts[1]} as AssetId,
        poolIdparts[2] === 'true' ? true : false
    ];
    console.log('poolId', poolId);
    //@ts-ignore
    const poolMetadata = await miraAmm.poolMetadata(poolId);
    console.log('poolMetadata response', poolMetadata);
    return {
        ...poolMetadata,
        reserve0: Number(poolMetadata?.reserve0),
        reserve1: Number(poolMetadata?.reserve1),
    };
}
