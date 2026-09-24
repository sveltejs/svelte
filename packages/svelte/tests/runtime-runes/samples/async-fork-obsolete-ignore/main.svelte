<script>
	import { fork } from "svelte";

	let count = $state(0);
	let queued = [];

	function push(v) {
		if (!v) return v;

		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}

	$effect(() => {
		console.log(count);
	})
</script>

{await push(count)}
<button onclick={() => fork(() => count++).discard()}>fork</button>
<button onclick={() => count++}>real</button>
<button onclick={() => queued.shift()?.()}>resolve</button>
