<script>
	import { untrack } from "svelte";

	let a = $state(0);
	let b = $state(0);
	let c = $state(0);

	const queued = [];
	function delay(v) {
		console.log('delay ' + v);
		if (!v) return v;
		return new Promise(resolve => {
			queued.push(() => resolve(v));
		});
	}

	$effect(() => {
		if (b + c === 0 || b + c > 2) return;
		console.log('effect run')
		untrack(() => {
			b++;
			c++;
		})
	})
</script>

<button onclick={() => { a++; b++; }}>increment</button>
<button onclick={() => queued.shift()?.()}>resolve</button>
{await delay(a + b + c)}
