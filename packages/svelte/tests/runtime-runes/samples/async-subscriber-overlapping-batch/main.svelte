<script lang="ts">
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
</script>

<button onclick={() => (id += 1)}>next</button>
<button onclick={() => deferreds.shift()?.()}>resolve</button>

<output>{value}</output>
