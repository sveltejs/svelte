<script lang="ts">
	let count = $state(0);
	let two_or_larger = $derived(count >= 2);

	$effect(() => {
		console.log(two_or_larger);
	});
</script>

<svelte:boundary>
	<button onclick={() => count += 1}>increment</button>
	<p>{await count}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
