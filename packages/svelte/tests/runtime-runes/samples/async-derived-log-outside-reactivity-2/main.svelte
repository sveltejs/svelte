<script>
	let a = $state(0);
	let b = $state(0);
	const c = $derived(a + b);
	const doubled = $derived(c * 2);
	const queued = [];

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => queued.push(() => resolve(value)));
	}
</script>

<p>{await delay(a)} {c} {doubled}</p>
<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => queued.shift()?.()}>resolve</button>
<button onclick={() => console.log({ a, b, c, doubled })}>read</button>
