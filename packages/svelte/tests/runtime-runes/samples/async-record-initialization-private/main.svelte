<script lang="ts">
	import Child from './Child.svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);

	const queue: Array<{ key: string; resolve: () => void }> = [];

	function load(label: string, value: number, signal?: AbortSignal) {
		if (label === 'ready' && value === 0) return Promise.resolve(value);
		console.log(`${label} ${value}`);
		const deferred = Promise.withResolvers<number>();
		let done = false;

		signal?.addEventListener('abort', () => {
			if (!done) console.log(`aborted ${label} ${value}`);
			deferred.reject(signal.reason);
		});

		queue.push({
			key: `${label} ${value}`,
			resolve: () => {
				done = true;
				deferred.resolve(value);
			}
		});

		return deferred.promise;
	}

	function resolve(key: string) {
		const index = queue.findIndex((entry) => entry.key === key);
		if (index !== -1) queue.splice(index, 1)[0].resolve();
	}

	let ready = $derived(await load('ready', Number(b)));
</script>

<button onclick={() => (a = true)}>a</button>
<button onclick={() => { b = true; x = 1; }}>b</button>
<button onclick={() => resolve('ready 1')}>ready</button>
<button onclick={() => resolve('first 0')}>first 0</button>
<button onclick={() => resolve('first 1')}>first 1</button>
<button onclick={() => resolve('second 0')}>second 0</button>
<button onclick={() => resolve('second 1')}>second 1</button>

<output>
	{#if ready || a}
		<Child {x} {load} />
	{/if}
</output>
