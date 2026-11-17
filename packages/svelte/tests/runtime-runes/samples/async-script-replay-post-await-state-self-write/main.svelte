<script lang="ts">
	import Child from './Child.svelte';

	const requests = new Map<string, { settled: boolean; resolve: () => void }>();
	const parked = new Promise<number>(() => {});
	let writes = 0;
	let overflow = false;

	function unexpected(message: string) {
		if (!overflow) console.log(message);
		overflow = true;
	}

	function allow_write() {
		if (writes === 4) {
			unexpected('unexpected write loop');
			return false;
		}
		writes += 1;
		console.log(`write ${writes}`);
		return true;
	}

	function load(site: string, input: number) {
		const key = `${site} ${input}`;
		if ((key !== 'start 0' && key !== 'value 1') || requests.has(key)) {
			unexpected(`unexpected load ${key}`);
			return parked;
		}
		console.log(`load ${key}`);
		const deferred = Promise.withResolvers<number>();
		requests.set(key, { settled: false, resolve: () => deferred.resolve(input) });
		return deferred.promise;
	}

	function resolve(key: string) {
		const request = requests.get(key);
		if (!request || request.settled) throw new Error(`Missing pending ${key}`);
		request.settled = true;
		request.resolve();
	}
</script>

<button onclick={() => resolve('start 0')}>resolve start</button>
<button onclick={() => resolve('value 1')}>resolve value</button>

<output>
	<svelte:boundary>
		<Child {load} {allow_write} />
		{#snippet pending()}pending{/snippet}
	</svelte:boundary>
</output>
