<script lang="ts">
    export let visible = false;
</script>

{#if visible}
    <div class="fixed inset-0 bg-[#131722]/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="flex flex-col items-center space-y-4">
            <div class="relative">
                <img 
                    src="/duck.png" 
                    alt="Loading..." 
                    class="w-32 h-32 animate-bounce"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#26a69a]/20 to-transparent"></div>
            </div>
            <div class="text-[#d1d4dc] text-lg font-medium">Loading pool data...</div>
        </div>
    </div>
{/if} 