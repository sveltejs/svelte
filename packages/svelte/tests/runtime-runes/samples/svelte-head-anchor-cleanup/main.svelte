<script>
	import Head from './Head.svelte';

	let show = $state(false);
</script>

<button onclick={() => (show = !show)}>toggle</button>

{#if show}
	<Head />
{/if}
