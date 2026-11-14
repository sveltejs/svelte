<script>
	import { getAbortSignal } from 'svelte';

	let a = $state(0);
	let x = $state(0);

	const queue = [];

	/** @type {() => void} */
	let resolve_x;

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

	function delay() {
		return new Promise((fulfil) => (resolve_x = () => fulfil('x')));
	}
</script>

<button onclick={() => x++}>x++</button>
<button onclick={() => a++}>a++</button>
<button onclick={() => resolve_x()}>resolve x</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<!-- keeps the batch that writes `x` pending, without touching the expression below -->
<i>{x ? await delay() : 0}</i>

<!-- only the run with `a === 1` depends on `x` -->
<p>{await load(a, a === 1 ? x : 0)}</p>
