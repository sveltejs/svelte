<script>
	import Wrapper from './wrapper.svelte';

	let rows = $state([
		{ nested: { depth: 1 } },
		{ nested: { depth: 3 } }
	]);
	let ptr = $state(0);

	let current = $derived(rows[ptr]);
	let currentLength = $derived(current?.length);
	let nested = $derived(current?.nested);

	$effect(() => {
		if (ptr === 1) {
			rows = [];
		}
	});
</script>

<Wrapper>
	{#if currentLength && nested?.depth > 2}
		deep
	{:else}
		shallow
	{/if}
</Wrapper>

<div>
	{#if nested?.depth > 2}
		deep
	{:else}
		shallow
	{/if}
</div>

<button onclick={() => (ptr = 1)}>advance</button>
