<script>
	let count = $state(0);

	function increment() {
		count += 1;
		console.log("in-increment", count);
	}

	$effect(() => {
		console.log("effect", count);
	});

	$inspect(count);
</script>

<button onclick={increment}>
	clicks: {count}
</button>
