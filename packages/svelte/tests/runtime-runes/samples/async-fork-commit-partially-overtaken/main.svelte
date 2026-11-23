<script>
	import { fork } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let f;

	/** @type {Map<number, () => void>} */
	const queue = new Map();

	function delay(value) {
		if (value === 0) return value;
		console.log(`delay ${value}`);
		return new Promise((resolve) => queue.set(value, () => resolve(value)));
	}

	function resolve(value) {
		queue.get(value)?.();
		queue.delete(value);
	}
</script>

<button onclick={() => (f = fork(() => { x = 10; y = 1; }))}>fork</button>
<button onclick={() => (x = 5)}>x = 5</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => resolve(10)}>resolve 10</button>
<button onclick={() => resolve(5)}>resolve 5</button>
<button onclick={() => { x = 0; y = 0; }}>reset</button>

<p>{await delay(x)}|{x}|{y}</p>
