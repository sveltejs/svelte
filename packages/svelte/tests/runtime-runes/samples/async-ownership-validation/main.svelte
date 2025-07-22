<script>
	import Child from './Child.svelte';

	let object = $state({ count: 0 });
</script>

<svelte:boundary>
	<Child {object} />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
