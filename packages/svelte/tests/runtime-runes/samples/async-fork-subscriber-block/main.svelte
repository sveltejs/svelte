<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import { createSubscriber } from 'svelte/reactivity';

	const subscribers = new Map<number, { subscribe: () => void; update?: () => void }>();

	function read(id: number) {
		if (!subscribers.has(id)) {
			const entry: { subscribe: () => void; update?: () => void } = { subscribe: () => {} };
			entry.subscribe = createSubscriber((update) => {
				entry.update = update;
				console.log(`start ${id}`);
				return () => {
					entry.update = undefined;
					console.log(`stop ${id}`);
				};
			});
			subscribers.set(id, entry);
		}

		subscribers.get(id)!.subscribe();
		console.log(`read ${id}`);
		return id;
	}

	let show = $state(true);
	let id = $state(1);
	let rev = $state(0);
	let pending: Fork | undefined;
</script>

<button onclick={() => (pending = fork(() => (id += 1)))}>fork</button>
<button onclick={() => pending?.commit()}>commit</button>
<button onclick={() => pending?.discard()}>discard</button>
<button onclick={() => { rev += 1; subscribers.get(1)?.update?.(); }}>notify 1</button>
<button onclick={() => (show = false)}>unmount</button>

{#if show}
	{#key read(id)}
		<output>{id}:{rev}</output>
	{/key}
{/if}
