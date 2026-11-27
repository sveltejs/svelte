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

	let initial = true;
	const deferreds: Array<() => void> = [];

	function load(id: number) {
		subscribe(id);
		console.log(`load ${id}`);

		if (initial) {
			initial = false;
			return Promise.resolve(id);
		}

		const { promise, resolve } = Promise.withResolvers<number>();
		deferreds.push(() => resolve(id));
		return promise;
	}

	let id = $state(1);
	const value = $derived(await load(id));
	let pending: Fork | undefined;
</script>

<button onclick={() => (pending = fork(() => (id += 1)))}>fork</button>
<button onclick={() => pending?.commit()}>commit</button>
<button onclick={() => pending?.discard()}>discard</button>
<button onclick={() => deferreds.shift()?.()}>resolve</button>

<output>{value}</output>
