<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let x = $state(0);
	let f: Fork | undefined;
	let g: Fork | undefined;
	const requests = new Map<number, { resolve: () => void; reject: () => void }>();

	function load(value: number) {
		console.log(`load ${value}`);
		const deferred = Promise.withResolvers<number>();
		requests.set(value, {
			resolve: () => deferred.resolve(value),
			reject: () => deferred.reject(new Error(`fork ${value} failed`))
		});
		return deferred.promise;
	}

	function onerror(error: unknown) {
		console.log(`onerror: ${error instanceof Error ? error.message : String(error)}`);
	}
</script>

<button onclick={() => (f = fork(() => (x = 1)))}>fork f</button>
<button onclick={() => (g = fork(() => (x = 2)))}>fork g</button>
<button onclick={() => requests.get(2)?.resolve()}>resolve g first</button>
<button onclick={() => requests.get(1)?.reject()}>reject f first</button>
<button onclick={() => requests.get(12)?.resolve()}>resolve g second</button>
<button onclick={() => g?.commit()}>commit g</button>
<button onclick={() => f?.discard()}>discard f</button>

<output>
	<svelte:boundary {onerror}>
		{#if x > 0}
			<Child {x} {load} />
		{/if}

		{#snippet failed()}<p>failed</p>{/snippet}
	</svelte:boundary>
</output>
