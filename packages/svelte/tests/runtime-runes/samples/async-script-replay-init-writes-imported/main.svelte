<script module lang="ts">
	// Module state is deliberately shared across attempts. The instance prefix
	// snapshots it; replay must not reset either the data or the diagnostic bounds.
	const shared = $state({ input: 0, count: 0 });
	const requests: Array<{ site: string; input: number; settled: boolean; resolve: () => void }> = [];
	const controls = { writes: 0, loads: 0, overflow: false };
	const parked = new Promise<number>(() => {});

	function overflow() {
		if (!controls.overflow) console.log('diagnostic overflow');
		controls.overflow = true;
	}

	function increment() {
		// Break a bad self-write loop without producing another reactive write.
		if (controls.writes === 4) {
			overflow();
			return shared.count;
		}
		controls.writes += 1;
		shared.count += 1;
		console.log(`write ${shared.count}`);
		return shared.count;
	}

	function load(site: string, input: number) {
		if (controls.loads === 8) {
			overflow();
			return parked;
		}
		controls.loads += 1;
		console.log(`load ${site} ${input}`);
		const deferred = Promise.withResolvers<number>();
		requests.push({ site, input, settled: false, resolve: () => deferred.resolve(input) });
		return deferred.promise;
	}

	function resolve(site: string, input: number) {
		const matches = requests.filter((request) => request.site === site && request.input === input);
		if (matches.length !== 1 || matches[0].settled) {
			throw new Error(`Expected one pending ${site}(${input}), got ${matches.length}`);
		}
		matches[0].settled = true;
		matches[0].resolve();
	}
</script>

<script lang="ts">
	import Child from './Child.svelte';
</script>

<button onclick={() => resolve('a', 0)}>resolve a</button>
<button onclick={() => resolve('b', 1)}>resolve b</button>

<output>
	<svelte:boundary>
		<Child {shared} {increment} {load} />
		{#snippet pending()}pending{/snippet}
	</svelte:boundary>
</output>
