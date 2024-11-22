import {env} from "$env/dynamic/public";
import type {MiraAmm, ReadonlyMiraAmm, PoolId} from "mira-dex-ts";
import {Account, Provider} from "fuels";
import type {AssetId} from "fuels";
import type { PoolCatalogEntry } from "$lib/types";
// import {getAllLPs} from "./data";

// Dynamically import mira-dex-ts to avoid SSR issues
export const getMiraDex = async () => {
    const { ReadonlyMiraAmm } = await import('mira-dex-ts');
    return { ReadonlyMiraAmm };
};

// For transaction-based operations
//@ts-ignore


// Initialize readonlyMiraAmm lazily
let readonlyMiraAmm: ReadonlyMiraAmm;

export async function getReadonlyMiraAmm() {
    if (!readonlyMiraAmm) {
        const provider = await Provider.create(env.PUBLIC_FUEL_RPC_URL);
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

export async function getPoolMetadata(pool: PoolCatalogEntry) {
    console.log("GETTING POOL METADATA")
    const poolIdparts = pool.id.split('_');
    const poolId: PoolId = [
        {bits: poolIdparts[0]} as AssetId,
        {bits: poolIdparts[1]} as AssetId,
        poolIdparts[2] === 'true' ? true : false
    ];
   
    const miraAmm = await getReadonlyMiraAmm();

    //@ts-ignore
    const poolMetadata = await miraAmm.poolMetadata(poolId);
    console.log('poolMetadata response', poolMetadata);
    console.log('poolMetadata::', {
        ...poolMetadata,
        reserve0: Number(poolMetadata?.reserve0),
        reserve1: Number(poolMetadata?.reserve1),
    });
    return {
        ...poolMetadata,
        reserve0: Number(poolMetadata?.reserve0),
        reserve1: Number(poolMetadata?.reserve1),
    };
}

// export async function getPoolMetadataForAllLPs() {
// 	const allLPs = await getAllLPs();
// 	const poolMetadata = await Promise.all(allLPs.map(getPoolMetadata));
// 	return poolMetadata;
// }
