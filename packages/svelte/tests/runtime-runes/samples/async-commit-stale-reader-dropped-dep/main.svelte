<script>
	let x = $state(0);
	let y = $state(0);

	const deferred = [];

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	$effect(() => {
		if (y === 1) {
			console.log(`effect ${x} ${y}`);
		} else {
			console.log(`effect _ ${y}`);
		}
	});
</script>

<p>{await delay(x)}</p>
<button onclick={() => x++}>x</button>
<button onclick={() => y++}>y</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
