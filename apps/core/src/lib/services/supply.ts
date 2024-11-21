
export async function getBaseAssetSupply(address: string) {
    const response = await fetch(`api/supply/${address}`);
    const data = await response.json();
    console.log("data::", data);
    return data;
}