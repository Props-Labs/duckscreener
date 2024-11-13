<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-8Z5T5S76DX"></script>
	<script>
	window.dataLayer = window.dataLayer || [];
	function gtag(){dataLayer.push(arguments);}
	gtag('js', new Date());

	gtag('config', 'G-8Z5T5S76DX');
	</script>
</svelte:head>

{@render children()}
