<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let count = $state(0);
	let f: Fork;
	const requests: Array<{
		site: string;
		value: number;
		settled: boolean;
		resolve: () => void;
	}> = [];

	function push(site: string, value: number) {
		console.log(value);
		return new Promise<number>((resolve) => {
			requests.push({ site, value, settled: false, resolve: () => resolve(value) });
		});
	}

	function resolve(site: string, value: number, occurrence = 0) {
		// Keep settled requests so an occurrence always names the same execution,
		// even when another attempt requests the same site and input.
		const request = requests.filter((request) => request.site === site && request.value === value)[
			occurrence
		];
		if (!request || request.settled) {
			throw new Error(`No pending ${site}(${value}) request at occurrence ${occurrence}`);
		}
		request.settled = true;
		request.resolve();
	}
</script>

<button onclick={() => (f = fork(() => (count = 1)))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => (count = 2)}>real</button>
<button onclick={() => resolve('first', 2)}>resolve fork first</button>
<button onclick={() => resolve('first', 3)}>resolve real first</button>
<button onclick={() => resolve('second', 4)}>resolve real second</button>
<button onclick={() => resolve('third', 5)}>resolve real third</button>
<button onclick={() => resolve('second', 3)}>resolve discarded fork second</button>

<output>
	{#if count > 0}
		<Child {count} {push} />
	{/if}
</output>
