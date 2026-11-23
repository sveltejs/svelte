<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let count = $state(0);
	let f: Fork;
	const requests = new Map<number, PromiseWithResolvers<number>>();

	function load(value: number) {
		console.log(`load ${value}`);
		const d = Promise.withResolvers<number>();
		requests.set(value, d);
		return d.promise;
	}

	function settle(reject: boolean) {
		const request = requests.get(1)!;
		if (reject) request.reject(new Error('discarded result'));
		else request.resolve(1);
	}

	function discard() {
		f.discard();
		count = 3;
	}

	function onerror(error: unknown) {
		console.log(`error: ${String(error)}`);
	}
</script>

<button onclick={() => (f = fork(() => (count = 1)))}>fork</button>
<button onclick={() => (count = 2)}>real</button>
<button onclick={() => settle(false)}>fulfil</button>
<button onclick={() => settle(true)}>reject</button>
<button onclick={discard}>discard</button>
<button onclick={() => requests.get(3)!.resolve(3)}>resolve 3</button>
<button onclick={() => requests.get(13)!.resolve(13)}>resolve 13</button>
<button onclick={() => requests.get(2)!.resolve(2)}>resolve old real</button>
<button onclick={() => (count = 0)}>reset</button>

<output>
	<b>{count}</b>
	<svelte:boundary {onerror}>
		{#if count > 0}<Child {count} {load} />{/if}
		{#snippet failed()}<p>failed</p>{/snippet}
	</svelte:boundary>
</output>
