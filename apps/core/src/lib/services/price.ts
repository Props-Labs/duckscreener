
export async function getBaseAssetPrice(address: string) {
    const response = await fetch(`api/price/${address}`);
    const data = await response.json();
    console.log("data::", data);
    return data;
}