<script>
	let values = $state([1]);

	const queue = [];

	function push(v) {
		if (v === 1) return v;

		const p = Promise.withResolvers();
		queue.push(() => p.resolve(v));
		return p.promise;
	}

	function addValue() {
		values.push(values.length+1);
	}
</script>

<button onclick={addValue}>add</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

<p>
	pending={$effect.pending()}
	values.length={values.length}
	values=[{values}]
</p>

<div>
	not keyed:
	{#each values as v}
		<div>
			{await push(v)}
		</div>
	{/each}
</div>
<div>
	keyed:
	{#each values as v(v)}
		<div>
			{await push(v)}
		</div>
	{/each}
</div>
