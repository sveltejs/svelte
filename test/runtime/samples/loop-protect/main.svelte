<script>
	let t = Date.now();
	while (true) {
		// do nothing
		if (Date.now() > t + 15) throw new Error('Failed loop protect test');
	}
</script>
