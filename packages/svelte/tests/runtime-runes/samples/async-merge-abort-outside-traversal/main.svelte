<script lang="ts">
	import { fork, getAbortSignal, type Fork } from 'svelte';

	let n = $state(0);
	let m = $state(0);
	let k = $state(0);
	let f: Fork;
	const queued: Array<() => void> = [];

	function load(n: number, m: number, signal: AbortSignal) {
		const label = `${n},${m}`;
		console.log(`load ${label}`);
		const d = Promise.withResolvers<number>();
		signal.addEventListener('abort', () => {
			console.log(`aborted ${label}`);
			d.reject(signal.reason);
		});
		d.promise.catch(() => {});
		return d.promise;
	}

	function delay(value: number) {
		if (value === 0) return Promise.resolve(value);
		return new Promise<number>((resolve) => queued.push(() => resolve(value)));
	}

	let promise = $derived(load(n, m, getAbortSignal()));

	function update_and_commit() {
		m = 1;
		void promise;
		void f.commit();
	}
</script>

<button onclick={() => (f = fork(() => (k = 1)))}>fork</button>
<button onclick={() => (n = 1)}>start</button>
<button onclick={update_and_commit}>update and commit</button>
<button onclick={() => queued.splice(0).forEach((resolve) => resolve())}>resolve</button>

{#if promise}{/if}
<output><i>{await delay(n)}</i><b>{await delay(m)}</b><span>{k}</span></output>
