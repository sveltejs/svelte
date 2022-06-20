<script>
	export async function run_generator() {
		const it = gen();
		it.next();

		await new Promise(resolve => setTimeout(resolve, 20));

		it.next();
	}

	function* gen() {
		while (true) {
			yield;
		}
	}
</script>