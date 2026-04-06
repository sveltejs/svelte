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

<p>{x} {await delay(y)}</p>

<button onclick={() => x += 1}>x</button>
<button onclick={() => f = fork(() => y += 1)}>y (fork)</button>
<button onclick={() => deferred.shift()?.()}>resolve</button>
<button onclick={() => f.commit()}>commit</button>
