<script>
	import { getAbortSignal } from 'svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);

	const queue = [];

	function load(v, signal) {
		const d = Promise.withResolvers();
		signal.addEventListener('abort', () => d.reject(signal.reason));
		queue.push(() => d.resolve(v));
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
