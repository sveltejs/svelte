<script>
	import Child from './Child.svelte';

	let { promise } = $props();
</script>

<svelte:boundary>
	<Child {promise} />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
