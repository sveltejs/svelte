<script>
	import { fork, getAbortSignal } from 'svelte';

	let show = $state(false);
	let x = $state(0);
	let f;

	const queue = [];

	function load(v, signal) {
		const d = Promise.withResolvers();
		signal.addEventListener('abort', () => d.reject(signal.reason));
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => queue.pop()?.()}>pop</button>
<button onclick={() => f.discard()}>discard</button>

{#if show}
	<p>{await load(x, getAbortSignal())}</p>
{/if}
