<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { debounce } from '$lib/utils/debounce';
    import type { PoolCatalogEntry } from '$lib/types';
    import { allPools, selectedPool } from '$lib/stores';

    const dispatch = createEventDispatcher();

    let searchTerm = '';
    let filteredPools: PoolCatalogEntry[] = [];
    let showDropdown = false;
    let searchInput: HTMLInputElement;
    let dropdownContainer: HTMLDivElement;

    // Update search term when selected pool changes
    $: if ($selectedPool) {
        searchTerm = `${$selectedPool.token0Name}-${$selectedPool.token1Name}`;
    }

    // Filter pools based on search term
    $: {
        if (!searchTerm) {
            filteredPools = [...$allPools].sort((a, b) => b.createdAt - a.createdAt);
        } else {
            const searchTermLower = searchTerm.toLowerCase();
            filteredPools = $allPools
                .filter(pool => 
                    pool.token0Name?.toLowerCase().includes(searchTermLower) ||
                    pool.token1Name?.toLowerCase().includes(searchTermLower) ||
                    pool.lpName?.toLowerCase().includes(searchTermLower)
                )
                .sort((a, b) => b.createdAt - a.createdAt);
        }
    }

    const handleInput = () => {
        if (!showDropdown) showDropdown = true;
    };

    const handleFocus = () => {
        showDropdown = true;
    };

    const handleSelectPool = (pool: PoolCatalogEntry) => {
        searchTerm = `${pool.token0Name}-${pool.token1Name}`;
        showDropdown = false;
        dispatch('select', pool);
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (!searchInput.contains(target) && !dropdownContainer?.contains(target)) {
            showDropdown = false;
        }
    };

    function clearSearch() {
        searchTerm = '';
        showDropdown = false;
    }

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div class="relative">
    <div class="flex items-center space-x-2">
        <div class="relative w-64">
            <input
                bind:this={searchInput}
                bind:value={searchTerm}
                on:input={handleInput}
                on:focus={handleFocus}
                type="text"
                placeholder="Search or click to browse pools..."
                class="w-full p-2 bg-[#2B2B43] text-[#d1d4dc] border border-[#2B2B43] rounded focus:outline-none focus:border-[#26a69a] pr-16"
            />
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                {#if searchTerm}
                    <button 
                        class="text-[#d1d4dc] opacity-60 hover:opacity-100 p-1"
                        on:click={clearSearch}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                {/if}
                <button 
                    class="text-[#d1d4dc] opacity-60 hover:opacity-100"
                    on:click={() => showDropdown = !showDropdown}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
        <!-- {#if $selectedPool}
            <span class="text-[10px] opacity-60 bg-[#26a69a]/10 px-2 py-0.5 rounded-full text-[#26a69a]">
                {$selectedPool.isStable ? 'Stable' : 'Volatile'}
            </span>
        {/if} -->
    </div>

    {#if showDropdown}
        <div 
            bind:this={dropdownContainer}
            class="absolute z-50 w-full mt-1 bg-[#2B2B43] border border-[#2B2B43] rounded shadow-lg max-h-[60vh] overflow-y-auto"
        >
            {#if filteredPools.length === 0}
                <div class="px-4 py-2 text-[#d1d4dc] opacity-60 text-center">
                    No pools found
                </div>
            {:else}
                {#each filteredPools as pool}
                    <button
                        class="w-full px-4 py-2 text-left hover:bg-[#363853] text-[#d1d4dc] flex items-center justify-between border-b border-[#363853] last:border-0"
                        on:click={() => handleSelectPool(pool)}
                    >
                        <div class="flex flex-col">
                            <span class="font-medium">{pool.token0Name}-{pool.token1Name}</span>
                            <span class="text-xs opacity-60">
                                TVL: {(Number(pool.reserve1) / 1e9).toFixed(2)} ETH
                            </span>
                        </div>
                        <div class="flex items-center space-x-2">
                            
                            <span class="text-[10px] px-2 py-0.5 rounded-full {pool.isStable ? 'bg-[#26a69a]/10 text-[#26a69a]' : 'bg-[#2196f3]/10 text-[#2196f3]'}">
                                {pool.isStable ? 'Stable' : 'Volatile'}
                            </span>
                        </div>
                    </button>
                {/each}
            {/if}
        </div>
    {/if}
</div> 