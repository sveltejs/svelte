<script>
	let z = $state(1);
	let w = $state(0);
	let pend = false;

	const deferred = [];

	let c = $derived(z > 0);

	function delay(value) {
		if (!pend) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	function log(value) {
		console.log(`eval ${value}`);
		return value;
	}
</script>

<p>{log(c)}</p>
<p>{await delay(w)}</p>
<button onclick={() => z++}>z</button>
<button onclick={() => { pend = true; w += 1; }}>w</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
