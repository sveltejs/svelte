<script>
	import { fork, getAbortSignal } from 'svelte';

	let y = $state(0);
	let z = $state(0);
	let show = $state(false);
	let preview = $state(false);
	let other = $state(false);
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

<button onclick={() => p}>read</button>
<button onclick={() => { y++; z++; }}>y++</button>
<button onclick={() => (f = fork(() => (show = true)))}>fork show</button>
<!-- (this fork writes `z` so that its view includes the writes of the batch that wrote `y`) -->
<button onclick={() => fork(() => { z++; preview = true; })}>fork preview</button>
<button onclick={() => { y++; other = true; }}>other</button>
<button onclick={() => pending.shift()?.()}>load</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => queue.shift()?.()}>shift</button>

{#if show}
	<p>{await p}</p>
{/if}

{#if preview}
	<b>{await p}</b>
{/if}

{#if other}
	<u>{await p}</u>
{/if}

<i>{y ? await delay(y) : 0}</i>
