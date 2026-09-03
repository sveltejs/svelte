<script>
	let x = $state(1);
	let show = $state(false);
	let pend = false;

	const deferred = [];

	let positive = $derived(x > 0);

	function delay(value) {
		if (!pend) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	$effect(() => {
		if (show) {
			console.log(`positive ${positive}`);
		}
	});
</script>

<p>{positive}</p>
<p>{await delay(x)}</p>
<button onclick={() => { pend = true; x += 1; }}>x</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
