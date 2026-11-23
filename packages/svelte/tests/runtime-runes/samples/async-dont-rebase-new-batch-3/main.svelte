<script>
	let count = $state(0);
	let double = $derived(count * 2);
	let count_mirror = $state(0);

	const queued = [];
	function delay(v) {
		if (!v) return v;
		return new Promise(resolve => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => count++}>count {await delay(count)} | count_mirror {await delay(count_mirror)}</button>
<button onclick={() => queued.shift()?.()}>shift</button>
<button onclick={() => queued.pop()?.()}>pop</button>

{#if count}
	<svelte:boundary>
		{await delay(count)}
		{#snippet pending()}loading{/snippet}
	</svelte:boundary>
	<!-- inside if block so effects are newly created and therefore added to batch.#new_effects -->
	<!-- first $effect creates new batch ... -->
	{(() => {
		$effect(() => {
			count_mirror = count;
		})
	})()}
	<!-- ... which second $effect shouldn't write to because the derived execution belongs to the previous batch -->
	{(() => {
		$effect(() => {
			console.log(double);
		})
	})()}
{/if}
