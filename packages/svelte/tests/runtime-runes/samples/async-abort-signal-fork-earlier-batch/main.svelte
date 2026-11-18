<script>
	import { fork, getAbortSignal } from 'svelte';
	let f;

	let a = $state(false);
	let c = $state(0);
	let x = $state(0);

	const queue = [];

	function load(label, v, signal) {
		console.log(`${label} ${v}`);
		if (label === 'c' && v === 0) return Promise.resolve(v);

		const d = Promise.withResolvers();
		signal?.addEventListener('abort', () => {
			console.log(`aborted ${label} ${v}`);
			d.reject(signal.reason);
		});
		queue.push(() => d.resolve(v));
		return d.promise;
	}

	let ready = $derived((await load('c', c)) > 0);

	$effect(() => console.log(`commit c=${c} a=${a} x=${x}`));
</script>

<button onclick={() => (f = fork(() => c++))}>c</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => { a = true; x = 1; }}>a</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => queue.pop()?.()}>pop</button>

{#if a || ready}
	<p>{await load('x', x, getAbortSignal())} {x}</p>
{/if}
