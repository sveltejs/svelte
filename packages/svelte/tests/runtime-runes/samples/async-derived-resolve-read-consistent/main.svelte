<script>
	let n = $state(0);
	const queued = [];

	function delay(value) {
		if (value === 0) return value;
		return new Promise((resolve) => queued.push(() => resolve(value)));
	}

	const value = $derived(await delay(n));
	const doubled = $derived(value * 2);
</script>

<button onclick={() => n++}>update</button>
<button
	onclick={() => {
		queued.shift()?.();

		function check(i) {
			console.log([value, doubled]);
			if (--i) queueMicrotask(() => check(i));
		}

		check(10);
	}}
>
	resolve and read
</button>

<p>{value}:{doubled}</p>
