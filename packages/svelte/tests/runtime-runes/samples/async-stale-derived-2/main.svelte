<script lang="ts">
	let count = $state(0);

	let a = [];
	let b = [];

	function push(deferreds, value) {
		const deferred = Promise.withResolvers();
		deferreds.push({ deferred, value });
		return deferred.promise;
	}
</script>

<button onclick={() => count += 1}>increment</button>
<button onclick={() => {
	const d = a.shift();
	d?.deferred.resolve(d.value);
}}>shift a</button>
<button onclick={() => {
	const d = b.shift();
	d?.deferred.resolve(d.value);
}}>shift b</button>

<svelte:boundary>
	{#if count % 2 === 0}
		<p>a: {await push(a, count)}</p>
	{:else}
		<p>b: {await push(b, count)}</p>
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
