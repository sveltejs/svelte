<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import { createSubscriber } from 'svelte/reactivity';

	const subscribers = new Map<number, () => void>();

	function subscribe(id: number) {
		if (!subscribers.has(id)) {
			subscribers.set(
				id,
				createSubscriber(() => {
					console.log(`start ${id}`);
					return () => console.log(`stop ${id}`);
				})
			);
		}

		subscribers.get(id)!();
	}

	let show = $state(true);
	let id = $state(1);
	const label = $derived.by(() => {
		subscribe(id);
		console.log(`derive ${id}`);
		return `item-${id}`;
	});

	let pending: Fork | undefined;
</script>

<button onclick={() => (pending = fork(() => (id += 1)))}>fork</button>
<button onclick={() => pending?.commit()}>commit</button>
<button onclick={() => pending?.discard()}>discard</button>
<button onclick={() => (show = false)}>hide</button>

{#if show}
	{#if label}
		<output>{label}</output>
	{/if}
{/if}
