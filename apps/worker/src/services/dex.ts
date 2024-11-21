import 'dotenv/config';

import {Account, Provider} from "fuels";
import type {AssetId} from "fuels";
import {initializeProvider} from "./provider";

// Initialize provider and readonlyMiraAmm lazily

let readonlyMiraAmm:any, MiraAmm:any;

export async function getReadonlyMiraAmm() {
    if (!readonlyMiraAmm) {
        // Import the entire module as a namespace
        const MiraDexTs = await import('mira-dex-ts');
        const provider = await initializeProvider();
        readonlyMiraAmm = new MiraDexTs.ReadonlyMiraAmm(provider);
    }
    return readonlyMiraAmm;
}

export async function getTotalAssets() {
    const miraAmm = await getReadonlyMiraAmm();
    const totalAssets = await miraAmm.totalAssets();
    return totalAssets;
}

export async function getLPAssetInfo(poolId: any) {
    const miraAmm = await getReadonlyMiraAmm();
    //@ts-ignore
    const assetInfo = await miraAmm.lpAssetInfo(poolId);
    return assetInfo;
}

export async function getPoolMetadata(pool_id: any) {
   // console.log('getPoolMetadata', pool_id);
    const poolIdparts = pool_id.split('_');
    const miraAmm = await getReadonlyMiraAmm();

    //console.log('poolIdparts', poolIdparts);

    const poolId = [
        {bits: poolIdparts[0]} as AssetId,
        {bits: poolIdparts[1]} as AssetId,
        poolIdparts[2] === 'true' ? true : false
    ];
    //console.log('poolId', poolId);
    //@ts-ignore
    const poolMetadata = await miraAmm.poolMetadata(poolId);
    //console.log('poolMetadata response', poolMetadata);
    return {
        ...poolMetadata,
        reserve0: Number(poolMetadata?.reserve0),
        reserve1: Number(poolMetadata?.reserve1),
    };
}
