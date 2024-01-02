<script>
	let count = $state(0);

	function onmouseup() {
		count += 2;
	}

	const plusOne = (num) => num + 1;
</script>

<Button onmousedown={() => count += 1} {onmouseup} onmouseenter={() => count = plusOne(count)}>
	clicks: {count}
</Button>
