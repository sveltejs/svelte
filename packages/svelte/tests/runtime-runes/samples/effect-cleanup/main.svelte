<script>
	const {log} = $props();

	let count = $state(0);

	$effect(() => {
		let double = $derived(count * 2)

		log.push('init ' + double);

		return () => {
			log.push('cleanup ' + double);
		};
	})
</script>

<button on:click={() => count++ }>Click</button>
