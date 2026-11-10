<script>
	import { getAbortSignal } from 'svelte';

	let a = $state(0);
	let x = $state(0);

	const queue = [];

	function load(a, x) {
		const signal = getAbortSignal();
		const label = `${a}/${x}`;
		console.log(`run ${label}`);

		return new Promise((resolve, reject) => {
			const entry = () => resolve(label);

			if (a === 0) {
				entry();
			} else {
				queue.push(entry);
			}

			signal.addEventListener('abort', () => {
				console.log(`aborted ${label}`);
				if (queue.includes(entry)) queue.splice(queue.indexOf(entry), 1);
				reject(signal.reason);
			});
		});
	}
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => x++}>x++</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<!-- only the run with `a === 1` depends on `x` -->
<p>{await load(a, a === 1 ? x : 0)}</p>
