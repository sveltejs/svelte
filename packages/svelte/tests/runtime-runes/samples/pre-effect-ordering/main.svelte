<script>
	let count = $state(0);

	function increment() {
		count += 1;
	}

	$effect.pre(() => {
		console.log(`Outer Effect Start (${count})`)

		$effect.pre(() => {
			console.log(`Inner Effect (${count})`)
		});

		console.log(`Outer Effect End (${count})`)
	});
</script>

<button on:click={increment}>
	Count: {count}
</button>
