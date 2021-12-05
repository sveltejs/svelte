<script>
	import { onMount } from 'svelte';

	export let x;

	export let inDocument;

	onMount(() => {
		inDocument = document.contains(x);
	});
</script>

<p bind:this={x}>{inDocument}</p>
