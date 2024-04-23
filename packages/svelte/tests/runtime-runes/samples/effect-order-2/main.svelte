<script>
	let a = $state(1);
	let b = $state(1);
	let c = $state(1);

	$effect(() => {
		console.log({ a });
	});

	$effect(() => {
		console.log({ b });
	});

	$effect(() => {
		console.log({ c });
	});

	function increment() {
		b += 1;
		c += 1;
		a += 1;
	}
</script>

<button onclick={increment}>
	increment
</button>
