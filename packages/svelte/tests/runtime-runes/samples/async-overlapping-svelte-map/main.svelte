<script>
	import { SvelteMap } from 'svelte/reactivity';

	let map = new SvelteMap([[1, 10]]);

	const queue = [];

	function push(k, v) {
		if (v === 10) return v;

		const p = Promise.withResolvers();
		queue.push(() => p.resolve(v));
		return p.promise;
	}

	function addValue() {
		map.set(map.size + 1, 10 * (map.size + 1));
	}
</script>

<button onclick={addValue}>add</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

<p>
	pending={$effect.pending()}
	map.size={map.size}
	map=[{Array.from(map)}]
</p>

<hr>

<p>1: {map.has(1)} {map.get(1) ?? '...'}</p>
<p>2: {map.has(2)} {map.get(2) ?? '...'}</p>
<p>3: {map.has(3)} {map.get(3) ?? '...'}</p>
<p>4: {map.has(4)} {map.get(4) ?? '...'}</p>
<p>5: {map.has(5)} {map.get(5) ?? '...'}</p>

<hr>

{#each map as [k, v] (k)}
	<p>{await push(k, v)}</p>
{/each}
