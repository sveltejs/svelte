<script>
	async function foo() {
		await 0;
		$effect(() => {
			console.log('this effect is orphaned');
		});
	}

	try {
		await foo();
	} catch (e) {
		console.log(e.message)
	}
</script>
