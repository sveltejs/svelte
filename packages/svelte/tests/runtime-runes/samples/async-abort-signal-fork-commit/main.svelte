<script>
	import { fork, getAbortSignal } from 'svelte';

	let a = $state(0);
	let b = $state(0);
	let show = $state(false);
	let f;

	const queue = [];

	function delay(a, b) {
		const signal = getAbortSignal();
		const label = `${a}/${b}`;
		console.log(`run ${label}`);

		return new Promise((resolve, reject) => {
			const entry = () => resolve(label);
			queue.push(entry);

			signal.addEventListener('abort', () => {
				console.log(`aborted ${label}`);
				if (queue.includes(entry)) queue.splice(queue.indexOf(entry), 1);
				reject(signal.reason);
			});
		});
	}
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>
<button onclick={() => (f = fork(() => a++))}>fork</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => (show = !show)}>toggle</button>

{#if show}
	<p>{await delay(a, b)}</p>
{/if}
