<script lang="ts">
    import { selectedPair} from '$lib/stores/pairs';
    export let visible = false;
</script>

{#if visible}
    <div class="fixed inset-0 bg-[#131722]/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="flex flex-col items-center space-y-4">
            <div class="relative">
                <img 
                    src="/logo.png" 
                    alt="Loading..." 
                    class="w-32 h-32 animate-bounce"
                />
                
            </div>
            <div class="text-[#d1d4dc] text-lg font-medium">Loading Chart Data...</div>
        </div>
    </div>
{/if} 