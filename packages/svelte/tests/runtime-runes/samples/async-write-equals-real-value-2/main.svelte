<script>
	let x = $state('a');
	let y = $state(0);
	let z = $state(0);
	let pend = false;

	const deferred = [];

	function delay(value) {
		if (!pend) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	$effect(() => {
		if (z > 0) {
			y = 1;
			x = 'b';
		}
	});
</script>

<p>{y}</p>
<p>{await delay(x)}</p>
<button
	onclick={() => {
		pend = true;
		x = 'b';
	}}>b</button
>
<button onclick={() => z++}>z</button>
