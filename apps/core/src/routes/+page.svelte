<script lang="ts">
    import { onMount } from 'svelte';
	import { query } from '$lib/hypersync';

    onMount(async () => {
        const result = await query({
      // start query from block 0
      fromBlock: 0,
      // if to_block is not set, query runs to the end of the chain
      toBlock: 1300000,
      // load inputs that have `asset_id` = 0x2a0d0ed9d2217ec7f32dcd9a1902ce2a66d68437aeff84e3a3cc8bebee0d2eea
      inputs: [
        {
          assetId: [
            "0x2a0d0ed9d2217ec7f32dcd9a1902ce2a66d68437aeff84e3a3cc8bebee0d2eea",
          ],
        },
      ],
      // fields we want returned from loaded inputs
      fieldSelection: {
        input: [
          "tx_id",
          "block_height",
          "input_type",
          "utxo_id",
          "owner",
          "amount",
          "asset_id",
        ],
      },
    });
        console.log(result);
    });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>