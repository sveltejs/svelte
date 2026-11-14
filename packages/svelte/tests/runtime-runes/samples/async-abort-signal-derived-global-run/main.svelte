<script>
	import { getAbortSignal } from 'svelte';

	let n = $state(0);
	let m = $state(0);
	let show = $state(false);

	const queue = [];
	const pending = [];

	function load(n, m, signal) {
		const label = `${n},${m}`;
		console.log(`load ${label}`);
		const d = Promise.withResolvers();
		signal.addEventListener('abort', () => {
			console.log(`aborted ${label}`);
			d.reject(signal.reason);
		});
		pending.push(() => d.resolve(label));
		d.promise.catch(() => {});
		return d.promise;
	}

	function delay(v) {
		if (v === 0) return Promise.resolve(v);
		return new Promise((fulfil) => queue.push(() => fulfil(v)));
	}

	let p = $derived(load(n, m, getAbortSignal()));
</script>

<button onclick={() => n++}>n++</button>
<button onclick={() => { m++; console.log(`handler ${typeof p}`); }}>m++</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => pending.splice(0).forEach((fulfil) => fulfil())}>load</button>

{#if p}{/if}

<i>{await delay(n)}</i>
<b>{await delay(m)}</b>

{#if show}
	<p>{await p}</p>
{/if}
