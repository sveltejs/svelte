<script>
	import { fork, getAbortSignal } from 'svelte';

	let y = $state(0);
	let z = $state(0);
	let show = $state(false);
	let preview = $state(false);
	let f;

	const queue = [];
	const pending = [];

	function load(v, signal) {
		console.log(`load ${v}`);
		const d = Promise.withResolvers();
		const entry = () => d.resolve(`p${v}`);
		signal.addEventListener('abort', () => {
			console.log(`aborted ${v}`);
			if (pending.includes(entry)) pending.splice(pending.indexOf(entry), 1);
			d.reject(signal.reason);
		});
		pending.push(entry);
		d.promise.catch(() => {});
		return d.promise;
	}

	function delay(v) {
		return new Promise((fulfil) => queue.push(() => fulfil(v)));
	}

	let p = $derived(load(y, getAbortSignal()));
</script>

<button onclick={() => (show = true)}>show</button>
<button onclick={() => { y++; z++; }}>y++</button>
<!-- (the fork writes `z` so that its view includes the writes of the batch that wrote `y`) -->
<button onclick={() => (f = fork(() => { z++; preview = true; }))}>fork</button>
<button onclick={() => pending.shift()?.()}>load</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => f.discard()}>discard</button>

{#if show}
	<p>{await p}</p>
{/if}

{#if preview}
	<b>{await p}</b>
{/if}

<i>{y ? await delay(y) : 0}</i>
