<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let count = $state(0);
	let show = $state(false);
	let marker = $state(0);
	let creator: Fork;
	let unrelated: Fork;
	const requests = new Map<number, () => void>();

	function load(value: number) {
		console.log(`load ${value}`);
		const d = Promise.withResolvers<number>();
		requests.set(value, () => d.resolve(value));
		return d.promise;
	}
</script>

<button onclick={() => (creator = fork(() => { show = true; count = 1; }))}>creator</button>
<button onclick={() => (show = true)}>real</button>
<button onclick={() => requests.get(0)!()}>resolve first</button>
<button onclick={() => (unrelated = fork(() => (marker = 99)))}>unrelated</button>
<button onclick={() => creator.discard()}>discard creator</button>
<button onclick={() => requests.get(10)!()}>resolve second</button>
<button onclick={() => unrelated.discard()}>discard unrelated</button>

<output>
	<i>{count}</i><b>{marker}</b>
	{#if show}
		<svelte:boundary>
			<Child {count} {marker} {load} />
			{#snippet pending()}<p>pending</p>{/snippet}
		</svelte:boundary>
	{/if}
</output>
