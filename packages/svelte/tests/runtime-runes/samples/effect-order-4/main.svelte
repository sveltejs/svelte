<script>
	let count = $state(0);

	function increment() {
		count += 1;
	}

	$effect.pre(() => {
		const doubled = count * 2;
		$effect(() => {
			console.log({ count, doubled });
		});
	});
</script>

<button onclick={increment}>
	clicks: {count}
</button>
