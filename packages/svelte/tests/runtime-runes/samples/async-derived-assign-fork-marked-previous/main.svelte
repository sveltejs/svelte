<script>
	import { fork } from 'svelte';

	let s = $state(1);
	let d = $derived(s * 2);
	let x = $state(0);
	let y = $state(0);

	const queue = [];

	function push(v) {
		if (!v) return v;
		return new Promise((resolve) => queue.push(() => resolve(v)));
	}
</script>

<button onclick={() => (d = 100)}>assign</button>
<button onclick={() => fork(() => (s = 5))}>fork</button>
<button onclick={() => x++}>x</button>
<button onclick={() => { y++; d = 200; }}>y</button>
<button onclick={() => queue.shift()?.()}>shift</button>

<p>{await push(x)} {await push(y)} {d}</p>
