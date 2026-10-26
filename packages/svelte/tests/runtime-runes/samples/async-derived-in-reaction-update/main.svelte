<script>
	import { make } from './helper.svelte.js';

	let x = $state(0);

	const queue = [];

	function load(v) {
		console.log(`load ${v}`);
		if (v === 0) return Promise.resolve(v);

		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}

	// the async derived inside `make` is created while this derived runs
	let thing = $derived(make(() => load(x)));
</script>

<button onclick={() => x++}>x</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<p>{(await thing).v} {x}</p>
