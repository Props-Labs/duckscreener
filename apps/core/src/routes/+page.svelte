<script lang="ts">
    import Chart from '$lib/components/chart.svelte';
    import { getPriceData } from '$lib/services/blockchain';
    const poolId = "0x86fa05e9fef64f76fa61c03f5906c87a03cb9148120b6171910566173d36fc9e_0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07_false";

    let ethPrice: any;
    let currentTokenPrice = 0;
    const TOTAL_SUPPLY = 1_000_000_000;

    async function getEthPrice() {
        ethPrice = await getPriceData("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419");
        if (ethPrice?.formattedPrice) {
            ethPrice.formattedPrice = Number(ethPrice.formattedPrice);
        }
    }

    function handlePriceUpdate(event: CustomEvent<number>) {
        currentTokenPrice = event.detail;
    }

    function formatCurrency(value: number): string {
        if (value >= 1_000_000_000) {
            return `$${(value / 1_000_000_000).toFixed(2)}B`;
        } else if (value >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(2)}M`;
        } else if (value >= 1_000) {
            return `$${(value / 1_000).toFixed(2)}K`;
        }
        return `$${value.toFixed(2)}`;
    }

    $: getEthPrice();
    $: marketCap = currentTokenPrice * TOTAL_SUPPLY * (ethPrice?.formattedPrice || 0);
</script>

<div class="flex flex-col h-screen bg-[#131722]">
    <div class="flex-1">
        <Chart {poolId} on:priceUpdate={handlePriceUpdate}>
            <div slot="toolbar" class="flex items-center space-x-4 text-[#d1d4dc]">
                <div class="flex items-center space-x-2">
                    <span class="text-sm opacity-80">Market Cap:</span>
                    <span class="font-semibold">{formatCurrency(marketCap)}</span>
                </div>
            </div>
        </Chart>
    </div>
</div>
