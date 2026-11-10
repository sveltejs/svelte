<script>
	import { fork, getAbortSignal } from 'svelte';

	let y = $state(0);
	let show = $state(true);
	let f;

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

	let p = $derived(load(y, getAbortSignal()));
</script>

<button onclick={() => (f = fork(() => (y = 1)))}>fork</button>
<button onclick={() => (show = !show)}>toggle</button>
<button onclick={() => pending.splice(0).forEach((fulfil) => fulfil())}>load</button>
<button onclick={() => f.commit()}>commit</button>

{#if show}
	<p>{await p}</p>
{/if}
