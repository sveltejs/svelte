<script>
	import { getAbortSignal } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let z = $state(0);

	const queue = [];
	const pending = [];

	function load(v, signal) {
		console.log(`load ${v}`);
		if (v === 0) return Promise.resolve(v);

		const d = Promise.withResolvers();
		signal.addEventListener('abort', () => {
			console.log(`aborted ${v}`);
			d.reject(signal.reason);
		});
		pending.push(() => d.resolve(v));
		d.promise.catch(() => {});
		return d.promise;
	}

	function delay(v) {
		if (v === 0) return Promise.resolve(v);
		return new Promise((fulfil) => queue.push(() => fulfil(v)));
	}

	let d = $derived(load(y, getAbortSignal()));
</script>

<button onclick={() => x++}>x++</button>
<button onclick={() => y++}>y++</button>
<button onclick={() => z++}>z++</button>
<button onclick={() => pending.splice(0).forEach((fulfil) => fulfil())}>load</button>

{#if z && d}{/if}

<p>{await d}</p>
<i>{await delay(x)}</i>
<b>{await delay(z)}</b>
