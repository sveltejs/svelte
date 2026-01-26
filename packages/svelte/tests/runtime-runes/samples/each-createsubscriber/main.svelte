<script>
	import { createSubscriber } from 'svelte/reactivity';

	const subscribe = createSubscriber(() => {});

	let items = $state([]);

	const proxy = new Proxy(items, {
		get: (target, prop) => (subscribe(), Reflect.get(target, prop))
	});
</script>

{#each proxy as item}
	<span>{item}</span>
{/each}

<button onclick={() => items.push(items.length + 1)}>add</button>
