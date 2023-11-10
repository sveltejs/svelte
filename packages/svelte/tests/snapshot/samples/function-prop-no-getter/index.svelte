<script>
	let count = $state(0);

	function onmouseup() {
		count += 2;
	}
</script>

<Button onmousedown={() => count += 1} {onmouseup}>
	clicks: {count}
</Button>
