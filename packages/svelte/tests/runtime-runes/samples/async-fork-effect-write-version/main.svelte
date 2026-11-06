<script>
	import { fork } from 'svelte';

	const resolvers = [];
	let f;

	let count = $state(0);
	let doubled = $derived(count * 2);
	let delayed = $derived(await delay(count));
	let nonnegative = $derived(delayed >= 0);

	function delay(value) {
		if (value === 0) return value;
		return new Promise((resolve) => resolvers.push(() => resolve(value)));
	}

	function load(value, nonnegative) {
		console.log([value, nonnegative]);
		return value;
	}
</script>

<button onclick={() => (f = fork(() => count++))}>fork</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>
<button onclick={() => f?.commit()}>commit</button>

<p>{await load(doubled, nonnegative)}</p>
