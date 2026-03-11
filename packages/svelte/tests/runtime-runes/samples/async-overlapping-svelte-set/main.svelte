<script>
	import { SvelteSet } from 'svelte/reactivity';

	let values = new SvelteSet([1]);

	const queue = [];

	function push(v) {
		if (v === 1) return v;

		const p = Promise.withResolvers();
		queue.push(() => p.resolve(v));
		return p.promise;
	}

	function addValue() {
		values.add(values.size + 1);
	}
</script>

<button onclick={addValue}>add</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

<p>
	pending={$effect.pending()}
	values.size={values.size}
	values=[{Array.from(values)}]
</p>

<hr>

<p>1: {values.has(1)}</p>
<p>2: {values.has(2)}</p>
<p>3: {values.has(3)}</p>
<p>4: {values.has(4)}</p>
<p>5: {values.has(5)}</p>

<hr>

{#each values as v(v)}
	<p>{await push(v)}</p>
{/each}
