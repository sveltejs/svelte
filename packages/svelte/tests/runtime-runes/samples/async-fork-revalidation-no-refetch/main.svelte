<script>
	import { fork } from 'svelte';

	let b = $state(0);
	let c = $state(0);
	let f;

	const deferred = [];

	function delay(_, value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<p>{await delay(console.log(`b ${b}`), b)} {c}</p>
<button onclick={() => { f = fork(() => { b += 1; c += 1; }); }}>fork</button>
<button onclick={() => b++}>real</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => f.discard()}>discard</button>
