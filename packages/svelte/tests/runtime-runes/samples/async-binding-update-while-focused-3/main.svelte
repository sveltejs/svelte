<script lang="ts">
	let selected = $state('two');

	let resolvers = [];
	let select;

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button onclick={() => {
	select?.focus();
	resolvers.shift()?.();
}}>shift</button>

<svelte:boundary>
	<select bind:this={select} bind:value={selected}>
		<option>one</option>
		<option>two</option>
		<option>three</option>
	</select>

	<p>{await push(selected)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
