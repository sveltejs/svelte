<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let revealed = $state(false);
	let input = $state(0);
	let speculative: Fork | undefined;
	const failure = new Error('prefix fork failed');
	const parked = new Promise<number>(() => {});
	let overflow = false;
	const requests: Array<{
		value: number;
		occurrence: number;
		settled: boolean;
		resolve: () => void;
		reject: () => void;
	}> = [];

	function load(value: number) {
		const occurrence = requests.filter((request) => request.value === value).length;
		// One failed input-1 request, one real input-0 request, or at most one
		// real and one replacement input-2 request. Never hide retries in a loop.
		if (occurrence >= (value === 2 ? 2 : 1)) {
			if (!overflow) console.log(`unexpected request ${value} #${occurrence}`);
			overflow = true;
			return parked;
		}
		console.log(`load ${value} #${occurrence}`);
		const deferred = Promise.withResolvers<number>();
		requests.push({
			value,
			occurrence,
			settled: false,
			resolve: () => deferred.resolve(value),
			reject: () => deferred.reject(failure)
		});
		return deferred.promise;
	}

	function settle(value: number, occurrence: number, reject = false) {
		const request = requests.find((request) => request.value === value && request.occurrence === occurrence);
		if (!request || request.settled) throw new Error(`Missing pending ${value} #${occurrence}`);
		request.settled = true;
		if (reject) request.reject();
		else request.resolve();
	}

	function reset() {
		speculative?.discard();
		speculative = undefined;
		show = revealed = false;
		input = 0;
		requests.length = 0;
		overflow = false;
	}
</script>

<button onclick={() => speculative = fork(() => { show = true; input = 1; })}>fork input 1</button>
<button onclick={() => revealed = true}>real unrelated input 0</button>
<button onclick={() => { revealed = true; input = 2; }}>real replacement input 2</button>
<button onclick={() => settle(1, 0, true)}>reject fork</button>
<button onclick={() => settle(0, 0)}>resolve real 0</button>
<button onclick={() => settle(2, 0)}>resolve real 2</button>
<button onclick={() => settle(2, 1)}>resolve replacement 2</button>
<button onclick={() => speculative?.commit()}>commit fork</button>
<button onclick={reset}>reset</button>

<output>
	{#if show || revealed}
		<svelte:boundary onerror={(error) => console.log(error === failure ? 'error original' : 'error unexpected')}>
			<Child {input} {load} />
			{#snippet failed(error)}
				<p>failed: {error === failure ? 'original' : 'unexpected'}</p>
			{/snippet}
		</svelte:boundary>
	{/if}
</output>
