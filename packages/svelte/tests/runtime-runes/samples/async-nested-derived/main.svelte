<script>
	import Child from './Child.svelte';

	let count = $state(0);
</script>

<button onclick={() => count += 1}>{count}</button>

<svelte:boundary>
	<Child {count} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
