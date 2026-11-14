<script>
	import { fork, getAbortSignal } from 'svelte';

	let y = $state(0);
	let show = $state(false);
	let f;

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

	let p = $derived(load(y, getAbortSignal()));
</script>

<button onclick={() => p}>read</button>
<button onclick={() => y++}>y++</button>
<button onclick={() => (f = fork(() => (show = true)))}>fork</button>
<button onclick={() => pending.shift()?.()}>load</button>
<button onclick={() => f.commit()}>commit</button>

{#if show}
	<p>{await p}</p>
{/if}
