<script>
	let count = 0;

	$: {
		console.log({ count, double });
	}

	// this comment should remain attached to this declaration after migration
	$: double = count * 2; // this too

	// triple
	let triple;
	$: {
		// update triple
		triple = count * 3;
		// trailing comment
		// in triple
	}

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>
	clicks: {count}
</button>