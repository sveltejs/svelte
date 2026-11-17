<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let revealed = $state(false);
	let input = $state(2);
	let speculative: Fork;
	const requests: Array<{ site: string; input: number; settled: boolean; resolve: () => void }> = [];
	const parked = new Promise<number>(() => {});
	let overflow = false;

	function load(site: string, value: number) {
		if ((value !== 1 && value !== 2) || requests.some((request) => request.site === site && request.input === value)) {
			if (!overflow) console.log(`unexpected load ${site} ${value}`);
			overflow = true;
			return parked;
		}
		console.log(`load ${site} ${value}`);
		const deferred = Promise.withResolvers<number>();
		requests.push({ site, input: value, settled: false, resolve: () => deferred.resolve(value) });
		return deferred.promise;
	}

	function resolve(site: string, value: number) {
		const request = requests.find((request) => request.site === site && request.input === value);
		if (!request || request.settled) throw new Error(`Missing pending ${site}(${value})`);
		request.settled = true;
		request.resolve();
	}
</script>

<button onclick={() => speculative = fork(() => { show = true; input = 1; })}>fork input 1</button>
<button onclick={() => resolve('first', 1)}>resolve fork first</button>
<button onclick={() => revealed = true}>real input 2</button>
<button onclick={() => resolve('first', 2)}>resolve real first</button>
<button onclick={() => resolve('last', 2)}>resolve real last</button>
<button onclick={() => resolve('last', 1)}>resolve fork last</button>
<button onclick={() => speculative.commit()}>commit fork</button>

<output>{#if show || revealed}<Child {input} {load} />{/if}</output>
