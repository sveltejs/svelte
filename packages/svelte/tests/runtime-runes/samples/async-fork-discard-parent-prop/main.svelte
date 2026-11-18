<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Parent from './Parent.svelte';

	let x = $state(0);
	let f: Fork;
	const requests = new Map<number, PromiseWithResolvers<number>>();

	function load(value: number) {
		console.log(`load ${value}`);
		const d = Promise.withResolvers<number>();
		requests.set(value, d);
		return d.promise;
	}

	function onerror(error: unknown) {
		console.log(`error: ${String(error)}`);
	}
</script>

<button onclick={() => (f = fork(() => (x = 1)))}>fork</button>
<button onclick={() => requests.get(1)?.resolve(1)}>resolve 1</button>
<button onclick={() => { f.discard(); x = 3; }}>discard and real</button>
<button onclick={() => requests.get(3)?.resolve(3)}>resolve 3</button>
<button onclick={() => requests.get(13)?.resolve(13)}>resolve 13</button>

<output>
	<svelte:boundary {onerror}>
		{#if x > 0}<Parent {x} {load} />{/if}
		{#snippet failed()}<p>failed</p>{/snippet}
	</svelte:boundary>
</output>
