<script>
	import { fork } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let f;
	const deferred = [];

	function delay(x, y) {
		console.log(`sum ${x},${y}`);
		const value = x + y;
		return value ? new Promise((resolve) => deferred.push(() => resolve(value))) : value;
	}

	async function double(value) {
		console.log(`double ${value}`);
		return value * 2;
	}

	let sum = $derived(await delay(x, y));
</script>

<button onclick={() => { f = fork(() => x++); }}>fork</button>
<button onclick={() => y++}>update</button>
<button onclick={() => deferred.pop()?.()}>pop</button>
<button onclick={() => f.commit()}>commit</button>

<p>{sum}</p>
<p>{await double(sum)}</p>
