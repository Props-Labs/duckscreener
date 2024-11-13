<script lang="ts">
    import Chart from '$lib/components/chart.svelte';
    import { getPriceData } from '$lib/services/blockchain';
    import { getPoolMetadataForAllLPs } from '$lib/services/dex';
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
    $: poolMetadata = getPoolMetadataForAllLPs();
    $: console.log(poolMetadata);
    $: marketCap = currentTokenPrice * TOTAL_SUPPLY * (ethPrice?.formattedPrice || 0);
</script>

<div class="flex flex-col h-screen bg-[#131722]">
    <div class="flex-1">
        <Chart {poolId} on:priceUpdate={handlePriceUpdate}>
            <div slot="toolbar" class="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-1 text-[#d1d4dc] w-full">
                <div class="flex items-center space-x-2 mb-2 sm:mb-0">
                    <span class="text-xs sm:text-sm opacity-80">Market Cap:</span>
                    <span class="text-sm sm:text-base font-semibold">{formatCurrency(marketCap)}</span>
                </div>
                <div class="flex flex-col items-start sm:items-end w-full sm:w-auto">
                    <span class="text-lg sm:text-xl font-bold text-[#26a69a]">
                        Duckscreener
                    </span>
                    <span class="text-[7px] sm:text-[8px] opacity-20 mt-0.5 break-all sm:break-normal max-w-[200px] sm:max-w-none">
                        Donate: 0x77C960337715b598Feb92AC53b3F736cA9F87c88abC42BB02B763C738e69679A
                    </span>
                    <span class="text-[9px] sm:text-[10px] opacity-40 mt-0.5 text-[#26a69a]">
                        <a href="https://x.com/Bitcoinski" target="_blank" class="hover:opacity-80">Made by @Bitcoinski</a>
                    </span>
                </div>
            </div>
        </Chart>
    </div>
</div>
