<script>
	import { fork } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let f;

	const deferred = [];

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<p>{await delay(x + y)}</p>
<button onclick={() => { f = fork(() => x++); }}>fork</button>
<button onclick={() => y++}>y</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => f.commit()}>commit</button>
