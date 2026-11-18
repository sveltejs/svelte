<script>
	import { fork } from 'svelte';

	let s = $state(0);
	let cond = $state(false);
	let u = $state(0);
	let big = $derived(s > 100);

	const queue = [];
	function push(v) {
		if (!v) return v;
		return new Promise((r) => queue.push(() => r(v)));
	}

	let f;
</script>

<button onclick={() => u++}>u</button>
<button onclick={() => (f = fork(() => s++))}>fork</button>
<button onclick={() => (cond = true)}>cond</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => queue.shift()()}>shift</button>

<p>{await push(u)}</p>
<p>{cond ? s : big}</p>
