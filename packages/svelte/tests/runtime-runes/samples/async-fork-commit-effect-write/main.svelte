<script>
	import { fork } from 'svelte';

	let x = $state(0);
	let f;
	const deferred = [];

	function delay(v) {
		if (!v) return v;
		return new Promise((r) => deferred.push(() => r(v)));
	}

	$effect(() => {
		if (x === 1) x = 2;
	});
</script>

<button onclick={() => (f = fork(() => (x = 1)))}>fork</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => deferred.shift()?.()}>shift</button>

<p>{await delay(x)}</p>
