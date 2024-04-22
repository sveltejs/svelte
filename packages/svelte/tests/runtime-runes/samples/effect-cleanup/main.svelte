<script>
	let count = $state(0);

	$effect(() => {
		let double = $derived(count * 2)

		console.log('init ' + double);

		return function() {
			console.log('cleanup ' + double);
			// @ts-expect-error
			console.log(this);
		};
	})
</script>

<button on:click={() => count++ }>Click</button>
