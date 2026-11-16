<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let x = $state(0);
	let count = $state(0);
	let f: Fork;
	const requests: Array<{ settled: boolean; resolve: () => void }> = [];

	function push() {
		console.log(`await ${requests.length}`);
		const d = Promise.withResolvers<void>();
		requests.push({ settled: false, resolve: () => d.resolve() });
		return d.promise;
	}

	function resolve(index: number) {
		const request = requests[index];
		if (!request || request.settled) throw new Error(`No pending await ${index}`);
		request.settled = true;
		request.resolve();
	}
</script>

<button onclick={() => (f = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => count++}>count</button>
<button onclick={() => resolve(0)}>resolve fork</button>
<button onclick={() => resolve(1)}>resolve real</button>
<button onclick={() => f.commit()}>commit</button>

<span>{count}</span>

{#if show}
	<Child {push} {x} />
{/if}
