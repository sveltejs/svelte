<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';
	let input = $state(0);
	let speculative: Fork;
	const requests: Array<{ site: string; input: number; resolve: (value: number) => void }> = [];
	function load(site: string, value: number, signal: AbortSignal) {
		console.log(`load ${site} ${value}`);
		signal.addEventListener('abort', () => console.log(`abort ${site} ${value}`));
		return new Promise<number>((resolve) => requests.push({ site, input: value, resolve }));
	}
	function resolve(site: string, value: number) {
		const index = requests.findIndex((r) => r.site === site && r.input === value);
		if (index !== -1) requests.splice(index, 1)[0].resolve(value + 1);
	}
</script>

<button onclick={() => (speculative = fork(() => { input = 1; }))}>fork</button>
<button onclick={() => resolve('a', 0)}>a real</button>
<button onclick={() => resolve('a', 1)}>a fork</button>
<button onclick={() => resolve('b', 1)}>b real</button>
<button onclick={() => resolve('c', 2)}>c real</button>
<button onclick={() => speculative.discard()}>discard</button>
<button onclick={() => resolve('b', 2)}>late b fork</button>
<output>
	<svelte:boundary>
		<Child {input} {load} />
		{#snippet pending()}<p>pending</p>{/snippet}
	</svelte:boundary>
</output>
