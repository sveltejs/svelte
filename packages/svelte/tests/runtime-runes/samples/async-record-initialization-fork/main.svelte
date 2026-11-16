<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let x = $state(0);
	let f: Fork;
	const pending = new Map<string, () => void>();

	function begin() {
		const d = Promise.withResolvers<void>();
		pending.set('begin', () => d.resolve());
		return d.promise;
	}

	function load(value: number, signal: AbortSignal) {
		console.log(`load ${value}`);
		const d = Promise.withResolvers<number>();
		pending.set(String(value), () => d.resolve(value));
		signal.addEventListener('abort', () => {
			console.log(`abort ${value}`);
			d.reject(signal.reason);
		});
		return d.promise;
	}

	function resolve(key: string) {
		const fn = pending.get(key)!;
		pending.delete(key);
		fn();
	}
</script>

<button onclick={() => (f = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => (show = false)}>hide</button>
<button onclick={() => resolve('begin')}>begin</button>
<button onclick={() => resolve('0')}>resolve 0</button>
<button onclick={() => resolve('1')}>resolve 1</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => f.discard()}>discard</button>

<output>
	<b>{x}</b>
	{#if show}<Child {x} {begin} {load} />{/if}
</output>
