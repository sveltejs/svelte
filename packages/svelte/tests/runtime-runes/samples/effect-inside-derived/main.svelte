<script>
	let count = $state(0);

	const { value } = $derived.by(() => {
		let value = $state(0);

		$effect(() => {
			value = count;
		});

		return {
			get value() {
				return value;
			}
		};
	});
</script>

<button onclick={() => (count += 1)}>clicks: {value}</button>
