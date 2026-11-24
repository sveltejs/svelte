<script>
	let x = $state(0);
	let y = $state(0);
	let pend = false;
	let doubled = $derived(x * 2);

	const deferred = [];

	function delay(value) {
		if (!pend) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	$effect(() => {
		if (y > 0) {
			console.log(`effect ${doubled} ${y}`);
		}
	});
</script>

<p>{await delay(x)}</p>
<button onclick={() => { pend = true; x += 1; }}>x</button>
<button onclick={() => y++}>y</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
