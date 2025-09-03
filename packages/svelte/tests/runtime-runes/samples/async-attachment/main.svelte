<script>
	import Inner from './Inner.svelte';
</script>

<svelte:boundary>
	<Inner />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>