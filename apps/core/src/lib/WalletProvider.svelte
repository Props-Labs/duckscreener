<script lang="ts">
	import { onMount } from 'svelte';
	import { createWalletStore } from './index.js';
	import type { FuelConnector } from 'fuels';

	export let connectors: Array<FuelConnector> = [];

	onMount(() => {
		createWalletStore({ connectors });
	});
</script>

<slot />