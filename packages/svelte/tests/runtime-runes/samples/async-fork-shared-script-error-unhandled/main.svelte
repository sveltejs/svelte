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
			reject: () => deferred.reject(new Error(`fork ${value} failed`))
		});
		return deferred.promise;
	}

	async function commit() {
		try {
			await speculative?.commit();
			console.log('committed');
		} catch (error) {
			console.log(error instanceof Error ? error.message.split('\n')[0] : String(error));
		}
	}
</script>

<button onclick={() => (speculative = fork(() => { show = true; x = 1; }))}>fork</button>
<button onclick={() => { show = true; x = 2; }}>real</button>
<button onclick={() => requests.get(1)?.reject()}>reject fork</button>
<button onclick={() => speculative?.discard()}>discard</button>
<button onclick={commit}>commit discarded</button>
<button onclick={() => requests.get(2)?.resolve()}>resolve real</button>

<output>
	{#if show}
		<Child {x} {load} />
	{/if}
</output>
