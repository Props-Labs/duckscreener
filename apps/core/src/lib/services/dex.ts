// import {env} from "$env/dynamic/public";
// import type {MiraAmm, ReadonlyMiraAmm} from "mira-dex-ts";
// import {Account, Provider} from "fuels";
// import {getAllLPs} from "./data";

// // Dynamically import mira-dex-ts to avoid SSR issues
// const getMiraDex = async () => {
//     const { ReadonlyMiraAmm } = await import('mira-dex-ts');
//     return { ReadonlyMiraAmm };
// };

// // For transaction-based operations
// //@ts-ignore
// const provider = await Provider.create(env.PUBLIC_FUEL_RPC_URL);

// // Initialize readonlyMiraAmm lazily
// let readonlyMiraAmm: ReadonlyMiraAmm;

// async function getReadonlyMiraAmm() {
//     if (!readonlyMiraAmm) {
//         const { ReadonlyMiraAmm } = await getMiraDex();
//         readonlyMiraAmm = new ReadonlyMiraAmm(provider);
//     }
//     return readonlyMiraAmm;
// }

// export async function getTotalAssets() {
//     const miraAmm = await getReadonlyMiraAmm();
//     const totalAssets = await miraAmm.totalAssets();
//     return totalAssets;
// }

// export async function getPoolMetadata(lp: any) {
//     console.log('getPoolMetadata', lp);
//     const poolIdparts = lp.pool_id.split('_');
//     const miraAmm = await getReadonlyMiraAmm();
//     //@ts-ignore
//     const poolMetadata = await miraAmm.poolMetadata([{bits: poolIdparts[0]}, {bits: poolIdparts[1]}, Boolean(poolIdparts[2])]);
//     return poolMetadata;
// }

// export async function getPoolMetadataForAllLPs() {
// 	const allLPs = await getAllLPs();
// 	const poolMetadata = await Promise.all(allLPs.map(getPoolMetadata));
// 	return poolMetadata;
// }
