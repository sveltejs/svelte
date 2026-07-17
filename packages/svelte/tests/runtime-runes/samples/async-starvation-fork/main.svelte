<script>
	import { fork } from 'svelte';

	let count = $state(0);
	let f;

	const deferred = new Map();

	function delay(value) {
		if (value === 0) return value;

		return new Promise((resolve) => {
			deferred.set(value, () => resolve(value));
		});
	}
</script>

<p>{count}:{await delay(count)}</p>
<button onclick={() => count++}>increment</button>
<button onclick={() => { f = fork(() => { count += 100; }); }}>fork</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => deferred.get(11)?.()}>resolve sealed</button>
<button onclick={() => deferred.get(count)?.()}>resolve latest</button>
