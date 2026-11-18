<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let x = $state(0);
	let speculative: Fork | undefined;
	const requests = new Map<number, { resolve: () => void; reject: () => void }>();

	function load(value: number) {
		console.log(`load ${value}`);
		const deferred = Promise.withResolvers<number>();
		requests.set(value, {
			resolve: () => deferred.resolve(value),
			reject: () => deferred.reject(new Error(`request ${value} failed`))
		});
		return deferred.promise;
	}

	function onerror(error: unknown) {
		console.log(`onerror: ${error instanceof Error ? error.message : String(error)}`);
	}
</script>

<button onclick={() => (speculative = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => { show = true; x = 2; }}>real</button>
<button onclick={() => requests.get(2)?.reject()}>reject real</button>
<button onclick={() => speculative?.discard()}>discard</button>
<button onclick={() => requests.get(1)?.resolve()}>resolve fork</button>

<output>
	<svelte:boundary {onerror}>
		{#if show}
			<Child {x} {load} />
		{/if}

		{#snippet failed()}<p>failed</p>{/snippet}
	</svelte:boundary>
</output>
