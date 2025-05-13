<script>
	let value = $state(0);

	$effect.pre(() => {
		console.log("Outer");
		value;

		$effect.pre(() => {
			console.log("Inner");
			value = 10;
		});
	});
</script>
