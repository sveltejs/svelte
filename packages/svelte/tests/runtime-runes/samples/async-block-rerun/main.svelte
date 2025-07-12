<script lang=ts>
	let deferred = Promise.withResolvers();
	let value = $state();
	let override = $state();
	let current = $derived(override ?? value);
	let promise = $state(update(['before']));

	async function update (v) {
		deferred = Promise.withResolvers();
		await deferred.promise;
		value = v;
	};

	function indirect() {
		override;
		return promise.then(() => current);
	}
</script>

<button onclick={() => {
	override = ['during'];
}}>override</button>

<button onclick={() => {
	override = null;
	promise = update(['after']);
}}>release</button>

<button onclick={() => {
	deferred.resolve(null);
}}>resolve</button>

<svelte:boundary>
	{#each await indirect() as entry}
		<p>{entry}</p>
	{/each}

	{#each current as entry}
		<p>{entry}</p>
	{/each}

	{#snippet pending()}
		<p>pending...</p>
	{/snippet}
</svelte:boundary>
