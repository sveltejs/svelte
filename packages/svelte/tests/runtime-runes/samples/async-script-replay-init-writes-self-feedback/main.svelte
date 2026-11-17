<script module lang="ts">
	// These controls must not be recreated by a bad initializer restart.
	const requests: Array<{ site: string; input: number; settled: boolean; resolve: () => void }> = [];
	const controls = { writes: 0, loads: 0, overflow: false };
	const parked = new Promise<number>(() => {});

	function overflow() {
		if (!controls.overflow) console.log('diagnostic overflow');
		controls.overflow = true;
	}

	function record_write(input: number, before: number, next: number) {
		if (controls.writes === 4) {
			overflow();
			return false;
		}
		controls.writes += 1;
		console.log(`write ${input} ${before} ${next}`);
		return true;
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

	function resolve_obsolete() {
		const old = requests.filter((request) => request.site === 'b' && request.input !== 12 && !request.settled);
		if (!old.some((request) => request.input === 2)) throw new Error('Missing old b(2) request');
		for (const request of old) {
			request.settled = true;
			request.resolve();
		}
	}
</script>

<script lang="ts">
	import Child from './Child.svelte';
	let input = $state(0);
</script>

<button onclick={() => resolve('a', 0)}>resolve initial a</button>
<button onclick={() => resolve('a', 1)}>resolve updated a</button>
<button onclick={() => (input = 10)}>external update</button>
<button onclick={() => resolve('a', 10)}>resolve replacement initial a</button>
<button onclick={() => resolve('a', 11)}>resolve replacement updated a</button>
<button onclick={() => resolve('b', 12)}>resolve replacement b</button>
<button onclick={resolve_obsolete}>resolve obsolete b requests</button>

<output>
	<svelte:boundary>
		<Child {input} {load} {record_write} />
		{#snippet pending()}pending{/snippet}
	</svelte:boundary>
</output>
