<script>
	import Child from './Child.svelte';

	let { promise, num } = $props();
</script>

<svelte:boundary>
	<Child {promise} {num} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
