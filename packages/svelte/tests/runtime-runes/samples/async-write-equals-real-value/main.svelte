<script>
	let x = $state('a');
	let z = $state(0);
	let pend = false;

	const deferred = [];

	function delay(value) {
		console.log(`fetch ${value}`);
		if (!pend) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	$effect(() => {
		if (z > 0) {
			x = 'b';
		}
	});
</script>

<p>{z}</p>
<p>{await delay(x)}</p>
<button onclick={() => { pend = true; x = 'b'; }}>b</button>
<button onclick={() => z++}>z</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
