import {env} from "$env/dynamic/public";
import type {MiraAmm, ReadonlyMiraAmm, PoolId} from "mira-dex-ts";
import {Account, Provider} from "fuels";
import type {AssetId} from "fuels";
// import {getAllLPs} from "./data";

// Dynamically import mira-dex-ts to avoid SSR issues
const getMiraDex = async () => {
    const { ReadonlyMiraAmm } = await import('mira-dex-ts');
    return { ReadonlyMiraAmm };
};

// For transaction-based operations
//@ts-ignore
const provider = await Provider.create(env.PUBLIC_FUEL_RPC_URL);

// Initialize readonlyMiraAmm lazily
let readonlyMiraAmm: ReadonlyMiraAmm;

async function getReadonlyMiraAmm() {
    if (!readonlyMiraAmm) {
        const { ReadonlyMiraAmm } = await getMiraDex();
        readonlyMiraAmm = new ReadonlyMiraAmm(provider);
    }
    return readonlyMiraAmm;
}

export async function getTotalAssets() {
    const miraAmm = await getReadonlyMiraAmm();
    const totalAssets = await miraAmm.totalAssets();
    return totalAssets;
}

export async function getPoolMetadata(pool_id: any) {
    console.log('getPoolMetadata', pool_id);
    const poolIdparts = pool_id.split('_');
    const miraAmm = await getReadonlyMiraAmm();

    const poolId: PoolId = [
        {bits: poolIdparts[0]} as AssetId,
        {bits: poolIdparts[1]} as AssetId,
        Boolean(poolIdparts[2])
    ];
    console.log('poolId', poolId);
    //@ts-ignore
    const poolMetadata = await miraAmm.poolMetadata(poolId);
    console.log('poolMetadata response', poolMetadata);
    return poolMetadata;
}

// export async function getPoolMetadataForAllLPs() {
// 	const allLPs = await getAllLPs();
// 	const poolMetadata = await Promise.all(allLPs.map(getPoolMetadata));
// 	return poolMetadata;
// }
