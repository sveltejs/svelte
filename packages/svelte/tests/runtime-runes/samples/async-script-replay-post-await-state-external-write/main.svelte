<script lang="ts">
	import Child from './Child.svelte';

	let increment: (() => void) | undefined;
	const requests: Array<{ site: string; input: number; occurrence: number; settled: boolean; resolve: () => void }> = [];
	const parked = new Promise<number>(() => {});
	let overflow = false;

	function register(fn: () => void) {
		increment = fn;
	}

	function load(site: string, input: number) {
		const occurrence = requests.filter((request) => request.site === site && request.input === input).length;
		const valid = site === 'start' ? input === 0 && occurrence < 2 : (input === 0 || input === 1) && occurrence === 0;
		if (!valid) {
			if (!overflow) console.log(`unexpected load ${site} ${input} #${occurrence}`);
			overflow = true;
			return parked;
		}
		console.log(`load ${site} ${input} #${occurrence}`);
		const deferred = Promise.withResolvers<number>();
		requests.push({ site, input, occurrence, settled: false, resolve: () => deferred.resolve(input) });
		return deferred.promise;
	}

	function resolve(site: string, input: number, occurrence = 0) {
		const request = requests.find((request) => request.site === site && request.input === input && request.occurrence === occurrence);
		if (!request || request.settled) throw new Error(`Missing pending ${site}(${input}) #${occurrence}`);
		request.settled = true;
		request.resolve();
	}

	function external_write() {
		if (!increment) throw new Error('Post-await state writer was not registered');
		increment();
	}
</script>

<button onclick={() => resolve('start', 0)}>resolve first start</button>
<button onclick={external_write}>external state write</button>
<button onclick={() => resolve('start', 0, 1)}>resolve replacement start</button>
<button onclick={() => resolve('value', 1)}>resolve replacement value</button>
<button onclick={() => resolve('value', 0)}>resolve old value</button>

<output>
	<svelte:boundary>
		<Child {register} {load} />
		{#snippet pending()}pending{/snippet}
	</svelte:boundary>
</output>
