<script lang="ts">
	import Child from './Child.svelte';

	let n = $state(0);
	let waiting = $state(false);
	let show = $state(false);
	let x = $state(0);
	const gate = Promise.withResolvers<number>();
	const requests: Array<{ value: number; settled: boolean; resolve: () => void }> = [];

	function load(value: number) {
		console.log(value);
		return new Promise<number>((resolve) => {
			requests.push({ value, settled: false, resolve: () => resolve(value) });
		});
	}

	function resolve(value: number, occurrence: number) {
		const request = requests.filter((request) => request.value === value)[occurrence];
		if (!request || request.settled) {
			throw new Error(`No pending load(${value}) request at occurrence ${occurrence}`);
		}
		request.settled = true;
		request.resolve();
	}
</script>

<button onclick={() => { n++; waiting = true; }}>start</button>
<button onclick={() => { n++; x = 1; show = true; }}>open</button>
<button onclick={() => { n++; x = 2; }}>update</button>
<button onclick={() => { n++; show = false; }}>hide</button>
<button onclick={() => { n++; show = true; }}>reveal</button>
<button onclick={() => resolve(2, 0)}>resolve update</button>
<button onclick={() => gate.resolve(1)}>finish</button>
<button onclick={() => resolve(2, 1)}>resolve reveal</button>
<button onclick={() => resolve(1, 0)}>resolve obsolete</button>

<output>
	<p>{n}</p><p>{waiting ? await gate.promise : 0}</p>
	{#if n && show}<Child {x} {load} />{/if}
</output>
