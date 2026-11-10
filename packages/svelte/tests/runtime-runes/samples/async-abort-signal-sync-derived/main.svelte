<script>
	import { getAbortSignal } from 'svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);

	const queue = [];

	function load(v, signal) {
		console.log(`load ${v}`);
		const d = Promise.withResolvers();
		const entry = () => d.resolve(v);
		signal.addEventListener('abort', () => {
			console.log(`aborted ${v}`);
			// (the promise may have resolved already, e.g. when the run is dropped after its batch committed)
			const i = queue.indexOf(entry);
			if (i !== -1) queue.splice(i, 1);
			d.reject(signal.reason);
		});
		queue.push(entry);
		return d.promise;
	}

	let p = $derived(load(x, getAbortSignal()));
</script>

<button onclick={() => { a = true; x = 1; }}>a</button>
<button onclick={() => (b = true)}>b</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

{#if a}
	<p>{await p} {x}</p>
{/if}

{#if b}
	<i>{await p} {x}</i>
{/if}
