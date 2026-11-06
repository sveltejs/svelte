<script>
	import { fork, getAbortSignal } from 'svelte';

	let a = $state(0);
	let show = $state(false);
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

	let p = $derived(load(a, getAbortSignal()));
</script>

<button onclick={() => (f = fork(() => (show = true)))}>fork</button>
<button onclick={() => a++}>a++</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => pending.splice(0).forEach((fulfil) => fulfil())}>load</button>
<button onclick={() => f.commit()}>commit</button>

{#if p}{/if}

{#if show}
	<p>{`${await delay('s')}:${await p}`}</p>
{/if}

<i>{a ? await delay(a) : 0}</i>
