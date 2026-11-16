<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let count = $state(0);
	let show = $state(false);
	let marker = $state(0);
	let creator: Fork;
	let unrelated: Fork;
	const requests: Array<{ site: string; value: number; settled: boolean; resolve: () => void }> = [];

	function load(site: string, value: number) {
		console.log(`load ${value}`);
		const d = Promise.withResolvers<number>();
		requests.push({ site, value, settled: false, resolve: () => d.resolve(value) });
		return d.promise;
	}

	function resolve(site: string, value: number, occurrence = 0) {
		const request = requests.filter((request) => request.site === site && request.value === value)[occurrence];
		if (!request || request.settled) {
			throw new Error(`No pending ${site}(${value}) request at occurrence ${occurrence}`);
		}
		request.settled = true;
		request.resolve();
	}
</script>

<button onclick={() => (creator = fork(() => { show = true; count = 1; }))}>creator</button>
<button onclick={() => (show = true)}>real</button>
<button onclick={() => resolve('first', 0)}>resolve real first</button>
<button onclick={() => (unrelated = fork(() => (marker = 99)))}>unrelated</button>
<button onclick={() => creator.discard()}>discard creator</button>
<button onclick={() => resolve('second', 10)}>resolve real second</button>
<button onclick={() => unrelated.discard()}>discard unrelated</button>
<button onclick={() => resolve('first', 1)}>resolve discarded creator</button>
<button onclick={() => resolve('first', 0, 1)}>resolve discarded unrelated</button>

<output>
	<i>{count}</i><b>{marker}</b>
	{#if show}
		<svelte:boundary>
			<Child {count} {marker} {load} />
			{#snippet pending()}<p>pending</p>{/snippet}
		</svelte:boundary>
	{/if}
</output>
