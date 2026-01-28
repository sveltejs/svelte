<script>
	let count = $state(0);
	let clicked = $state(false);

	function increment() {
		clicked = true;
		count++;
	}

	$effect(() => {
		if (clicked) {
			count++;
		}
	});
</script>

<button onclick={increment}>{count}</button>
