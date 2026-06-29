<script>
	import Inner from './Inner.svelte';
	let { promise } = $props();
</script>

<svelte:boundary>
	<Inner {promise} />
	<p>Something inside</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
<p>Something outside</p>
