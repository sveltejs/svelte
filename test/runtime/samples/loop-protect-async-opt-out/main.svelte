<script>
	export async function run_async_function() {
		await loop();
	}

	async function loop() {
		let i = 0;
		while (i ++ < 5) {
			await new Promise(resolve => setTimeout(resolve, 20));
		}
	}
</script>
