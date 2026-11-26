<script>
	let value = $state({ id: '0' });
	const resolvers = [];

	function wait() {
		const promise = Promise.withResolvers();
		resolvers.push(promise.resolve);
		return promise.promise;
	}

	function spam() {
		value.id = `${Number(value.id) + 1}`;
	}
</script>

<button class="spam" onclick={spam}>Spam</button>
<button class="resolve" onclick={() => resolvers.shift()?.()}>Resolve</button>

<svelte:boundary>
	{#each [value.id] as s (s)}
		{await wait()}
		<div>{s}</div>
	{/each}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
