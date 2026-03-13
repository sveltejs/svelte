<script lang="ts">
	let selected = $state('a');
	let items = $state(['a', 'b']);

	let resolvers = [];
	let select;

	function push(value) {
		const { promise, resolve } = Promise.withResolvers();
		resolvers.push(() => resolve(value));
		return promise;
	}
</script>

<button id="add" onclick={() => items.push(String.fromCharCode(97 + items.length))}>add</button>
<button id="shift" onclick={() => {
	select?.focus();
	resolvers.shift()?.();
}}>shift</button>

<svelte:boundary>
	<select bind:this={select} bind:value={selected}>
		{#each items as item}
			<option value={item}>{item}</option>
		{/each}
	</select>

	<p>{await push(selected)}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
