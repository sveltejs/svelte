<script>
	import Inner from './Inner.svelte';

	let show = $state(true);
</script>

<svelte:boundary>
	<button onclick={() => show = !show}>toggle</button>
	{#if show}
		<Inner />
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
