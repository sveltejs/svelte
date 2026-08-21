<script>
	import { fork } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let f;

	const deferred = [];

	function delay(_, value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
 
</script>

<button onclick={() => {f = fork(() => x++)}}>x</button>
<button onclick={() => y++}>y</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => deferred.pop()?.()}>pop</button>
<button onclick={() => f.commit()}>commit</button>

<p>{await delay(console.log('called with ' + x + ',' + y), x + y)}</p>
