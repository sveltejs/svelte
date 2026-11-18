<script>
	import { fork, getAbortSignal } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let f;
	const resolvers = [];

	function load(x, y) {
		console.log(`${x}/${y}`);
		const signal = getAbortSignal();
		if (y === 0) return `${x}/${y}`;

		return new Promise((resolve, reject) => {
			resolvers.push(() => resolve(`${x}/${y}`));
			signal.addEventListener('abort', () => reject(signal.reason));
		});
	}

	function speculate() {
		f = fork(() => { x = 1; });
	}

	function update_and_discard(use_fork) {
		if (use_fork) {
			fork(() => { y = 1; }).commit();
		} else {
			y = 1;
		}
		f.discard();
	}

	function finish() {
		for (const resolve of resolvers.splice(0)) resolve();
	}

	function reset() {
		y = 0;
	}
</script>

<button onclick={speculate}>fork x = 1</button>
<button onclick={() => update_and_discard(false)}>update y and discard</button>
<button onclick={() => update_and_discard(true)}>commit y fork and discard</button>
<button onclick={finish}>resolve requests</button>
<button onclick={reset}>reset</button>

<p>{await load(x, y)}</p>
