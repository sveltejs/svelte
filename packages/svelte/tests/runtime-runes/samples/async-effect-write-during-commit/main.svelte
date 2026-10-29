<script>
	let a = $state(0);
	let x = $state(0);
	const pending = [];

	function f(v) {
		return new Promise((resolve) => pending.push(() => resolve(v)));
	}

	// nothing (including the buttons) shows up until the initial render resolves
	queueMicrotask(() => pending.shift()?.());

	$effect(() => {
		if (x === 1) x = 2;
	});

	$effect(() => {
		console.log(`x ${x}`);
	});
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => x++}>x</button>
<p>{await f(a)}</p>
