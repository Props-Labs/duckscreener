<script lang="ts">
	console.log('layout::');
	import '../app.css';
	import { GoogleAnalytics } from '@beyonk/svelte-google-analytics'
	let { children } = $props();

</script>


<GoogleAnalytics properties={['G-8Z5T5S76DX' ]} />
{@render children()}



