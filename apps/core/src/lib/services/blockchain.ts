import { env } from '$env/dynamic/public';
import { ethers } from 'ethers';
import { aggregatorV3InterfaceABI } from './abis';

export async function getPriceData(address: string) {
    const provider = new ethers.JsonRpcProvider(env.PUBLIC_RPC_URL);
    const contract = new ethers.Contract(address, aggregatorV3InterfaceABI, provider);
    try {
        //@ts-ignore
        const roundData = await contract.latestRoundData();
        // Convert price to human-readable format (8 decimal places)
        const price = Number(roundData.answer) / 1e8;
        return {
            ...roundData,
            formattedPrice: price.toFixed(2)
        };
    } catch (error) {
        console.error("Error fetching price data:", error);
        throw error;
    }
}