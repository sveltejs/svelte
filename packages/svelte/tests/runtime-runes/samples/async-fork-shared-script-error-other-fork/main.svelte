<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let x = $state(0);
	let f: Fork | undefined;
	let g: Fork | undefined;
	const requests: Array<{ value: number; settled: boolean; resolve: () => void; reject: () => void }> = [];

	function load(value: number) {
		console.log(`load ${value}`);
		const deferred = Promise.withResolvers<number>();
		requests.push({
			value,
			settled: false,
			resolve: () => deferred.resolve(value),
			reject: () => deferred.reject(new Error(`fork ${value} failed`))
		});
		return deferred.promise;
	}

	function settle(value: number, occurrence: number, reject = false) {
		const request = requests.filter((request) => request.value === value)[occurrence];
		if (!request || request.settled) {
			throw new Error(`No pending load(${value}) request at occurrence ${occurrence}`);
		}
		request.settled = true;
		if (reject) request.reject();
		else request.resolve();
	}

	function onerror(error: unknown) {
		console.log(`onerror: ${error instanceof Error ? error.message : String(error)}`);
	}
</script>

<button onclick={() => (f = fork(() => (x = 1)))}>fork f</button>
<button onclick={() => (g = fork(() => (x = 2)))}>fork g</button>
<button onclick={() => settle(2, 0)}>resolve g first</button>
<button onclick={() => settle(1, 0, true)}>reject f first</button>
<button onclick={() => settle(12, 0)}>resolve g second</button>
<button onclick={() => g?.commit()}>commit g</button>
<button onclick={() => f?.discard()}>discard f</button>
<button onclick={() => settle(2, 1)}>resolve discarded replacement</button>

<output>
	<svelte:boundary {onerror}>
		{#if x > 0}
			<Child {x} {load} />
		{/if}

		{#snippet failed()}<p>failed</p>{/snippet}
	</svelte:boundary>
</output>
