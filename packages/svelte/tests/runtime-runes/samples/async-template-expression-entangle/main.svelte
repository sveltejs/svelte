<script>
	let a = $state(0);
	let b = $state(0);
	const c = $derived(add(a, b))
	let pend = false;

	const deferred = [];

	function delay(value) {
		if (!pend) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	function add(x, y) {
		return x + y;
	}
</script>

<p>{await delay(a)}</p>
<p>{c}</p>
<button onclick={() => { pend = true; a++; }}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
