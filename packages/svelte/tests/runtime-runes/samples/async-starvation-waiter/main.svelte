<script>
	import { settled } from 'svelte';

	let count = $state(0);
	let independent = $state(0);
	let doubled = $derived(count * 2);
	const deferred = new Map();

	function delay(value) {
		if (value === 0) return value;

		return new Promise((resolve) => {
			deferred.set(value, () => resolve(value));
		});
	}

	async function increment() {
		count += 1;
		await settled();
		console.log('settled');
	}
</script>

<p>{count}:{independent}:{doubled}:{await delay(doubled)}</p>
<button onclick={increment}>increment</button>
<button onclick={() => independent++}>independent</button>
<button onclick={() => deferred.get(22)?.()}>resolve sealed</button>
<button onclick={() => deferred.get(count * 2)?.()}>resolve latest</button>
