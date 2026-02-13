<script lang="ts">
	let count = $state(0);

	let resolvers = [];
	let input;

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => {
	input?.focus();
	resolvers.shift()?.();
}}>shift</button>

<svelte:boundary>
	<input bind:this={input} type="number" bind:value={count} />
	<p>{await push(count)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
