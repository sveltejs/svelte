<script lang="ts">
	let data = $state(Promise.resolve(0));

	let count = $state(0);
	let unrelated = $state(0);

	$effect(() => {
		data = Promise.resolve(count)
		unrelated = count;
	});
</script>

<svelte:boundary>
	<button onclick={() => count += 1}>increment</button>
	<p>{JSON.stringify((await data), null, 2)}</p>
	{#if true}
		<!-- inside if block to force it into a different render effect -->
		<p>{unrelated}</p>
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
