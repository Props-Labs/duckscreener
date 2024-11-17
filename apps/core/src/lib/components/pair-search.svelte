<script lang="ts">
    import { pairs, searchQuery, selectedPair, fetchPairs } from '$lib/stores/pairs';
    import type { TradingPair } from '$lib/services/pairs';
    import { onMount } from 'svelte';
    import { filterPairs } from '$lib/stores/pairs';

    let filteredPairs: TradingPair[] = [];
    let loading = true;
    let error: string | null = null;

    // Update filtered pairs when search query changes
    $: filteredPairs = filterPairs($pairs, $searchQuery);

    onMount(async () => {
        try {
            await fetchPairs();
            loading = false;
        } catch (err) {
            error = 'Failed to load trading pairs';
            loading = false;
        }
    });

    function selectPair(pair: TradingPair) {
        selectedPair.set(pair);
    }
</script>

<div class="w-full max-w-md mx-auto bg-[#1e222d] rounded-xl shadow-lg overflow-hidden">
    <div class="p-4">
        <input
            type="text"
            bind:value={$searchQuery}
            placeholder="Search pairs... (e.g. ETH, PSYCHO)"
            class="w-full px-4 py-2 bg-[#2B2B43] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#26a69a]"
        />
    </div>

    {#if loading}
        <div class="p-4 text-center text-gray-400">Loading pairs...</div>
    {:else if error}
        <div class="p-4 text-center text-red-400">{error}</div>
    {:else}
        <div class="max-h-96 overflow-y-auto">
            {#each filteredPairs as pair}
                <button
                    on:click={() => selectPair(pair)}
                    class="w-full p-4 hover:bg-[#2B2B43] flex items-center justify-between transition-colors"
                >
                    <div class="flex items-center">
                        <span class="text-white font-medium">
                            {pair.token0Symbol}/{pair.token1Symbol}
                        </span>
                        {#if pair.isStable}
                            <span class="ml-2 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                                Stable
                            </span>
                        {/if}
                    </div>
                    <div class="text-sm text-gray-400">
                        TVL: ${pair.tvl || '0'}
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div> 