<script>
	import Child from './Child.svelte';

	let count = $state(0);

	const things = $derived.by(() => {
		if (count === 1) {
			throw new Error('123')
		}
		return [1, 2 ,3]
	})
</script>

<button onclick={() => count++}>change</button>

<svelte:boundary>
	<Child {things} />

	{#snippet failed()}
		<p>Error occured</p>
	{/snippet}
</svelte:boundary>
