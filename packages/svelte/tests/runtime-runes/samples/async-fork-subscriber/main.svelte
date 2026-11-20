<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import { createSubscriber } from 'svelte/reactivity';

	let id = $state(1);
	let pending: Fork;
	let calls = 0;
	const subscribers = new Map<number, () => void>();
	const resolves: (() => void)[] = [];

	function load(id: number) {
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
		console.log(`load ${id}`);
		if (++calls === 1) return id;
		return new Promise<number>((resolve) => resolves.push(() => resolve(id)));
	}

	let value = $derived(await load(id));
</script>

<button onclick={() => (pending = fork(() => id++))}>fork</button>
<button onclick={() => pending.discard()}>discard</button>
<button onclick={() => pending.commit()}>commit</button>
<button onclick={() => resolves.shift()!()}>resolve</button>

<output>{value}</output>
