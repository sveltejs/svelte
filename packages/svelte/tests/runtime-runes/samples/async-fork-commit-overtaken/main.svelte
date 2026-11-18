<script>
	import { fork } from 'svelte';

	let x = $state(0);
	let f;
	let error = $state('');
	const deferred = [];

	function delay(value) {
		if (value === 0) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<button onclick={() => { f = fork(() => { x = 10; }); }}>fork</button>
<button onclick={() => (x = 5)}>x = 5</button>
<button onclick={() => { f.commit().catch((e) => (error = e.message)); }}>commit</button>
<button onclick={() => deferred.shift()?.()}>shift</button>

<p>{await delay(x)} {error}</p>
