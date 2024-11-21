import 'dotenv/config';
import type {MiraAmm, PoolId} from "mira-dex-ts";
import {Account, Provider} from "fuels";
import type {AssetId} from "fuels";
import {initializeProvider} from "./provider";

// Initialize provider and readonlyMiraAmm lazily
let readonlyMiraAmm: any;
let MiraDex: any;

const initMiraDex = async () => {
    MiraDex = await import('mira-dex-ts');
};

export async function getReadonlyMiraAmm() {
    if (!MiraDex) {
        await initMiraDex();
    }
    if (!readonlyMiraAmm) {
        const provider = await initializeProvider();
        readonlyMiraAmm = new MiraDex.ReadonlyMiraAmm(provider);
    }
    return readonlyMiraAmm;
}

export async function getTotalAssets() {
    const miraAmm = await getReadonlyMiraAmm();
    const totalAssets = await miraAmm.totalAssets();
    return totalAssets;
}

export async function getLPAssetInfo(assetId: AssetId) {
    const miraAmm = await getReadonlyMiraAmm();
    const assetInfo = await miraAmm.lpAssetInfo(assetId);
    return assetInfo;
}

export async function getPoolMetadata(pool_id: any) {
    const poolIdparts = pool_id.split('_');
    const miraAmm = await getReadonlyMiraAmm();

    const poolId: PoolId = [
        {bits: poolIdparts[0]} as AssetId,
        {bits: poolIdparts[1]} as AssetId,
        poolIdparts[2] === 'true' ? true : false
    ];

    const poolMetadata = await miraAmm.poolMetadata(poolId);
    return {
        ...poolMetadata,
        reserve0: Number(poolMetadata?.reserve0),
        reserve1: Number(poolMetadata?.reserve1),
    };
}
