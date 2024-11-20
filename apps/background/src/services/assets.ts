import { getValue, storeValue, deleteValue } from './redis';

import type {
    Provider,
    InvokeFunction,
    BN,
    JsonAbi,
    Account,
    Asset,
    AssetFuel
} from 'fuels';
import { assets, CHAIN_IDS, getAssetFuel, Contract, Interface } from 'fuels';

export const DATA_TTL = 60 * 60 * 24 * 365 * 10;

export async function loadAssetData(){
    console.log(assets);
    await storeValue("fuel_assets", JSON.stringify(assets), DATA_TTL);

    // for(let a = 0; a < assets.length; a++){
    //     const asset = assets[a];
    //     console.log("ASSET", asset)
    //     for(let n = 0; n < asset.networks.length; n++){
    //         const network = asset.networks[n];
    //         const assetOnFuel: AssetFuel = getAssetFuel(asset, network.chainId)!;
    //         console.log('assetOnFuel', assetOnFuel)

    //     }
        
    // }

    return;
}