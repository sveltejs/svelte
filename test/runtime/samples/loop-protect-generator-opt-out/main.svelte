<script>
	const it = gen();
	it.next();

	setTimeout(() => {
		it.next();
	}, 20)

	function* gen() {
		while (true) {
			yield;
		}
	}
</script>