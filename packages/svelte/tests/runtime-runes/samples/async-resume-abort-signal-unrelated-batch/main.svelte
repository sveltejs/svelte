<script>
	import { getAbortSignal } from 'svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);

	const queue = [];

	function load(v, signal) {
		console.log(`load ${v}`);
		const d = Promise.withResolvers();
		let done = false;
		signal.addEventListener('abort', () => {
			// (aborting a run that's done anyway doesn't matter)
			if (!done) console.log(`aborted ${v}`);
			d.reject(signal.reason);
		});
		queue.push(() => {
			done = true;
			d.resolve(v);
		});
		return d.promise;
	}
</script>

<button onclick={() => { a = true; x = 1; }}>a</button>
<button onclick={() => (b = true)}>b</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

{#if a || b}
	<p>{await load(x, getAbortSignal())} {x}</p>
{/if}
