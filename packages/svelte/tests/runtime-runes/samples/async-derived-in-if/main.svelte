<script>
	import Child from './Child.svelte';

	let show = $state(false);
</script>

<button onclick={() => show = true}>show</button>

<svelte:boundary>
	{#if show}
		<Child />
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
