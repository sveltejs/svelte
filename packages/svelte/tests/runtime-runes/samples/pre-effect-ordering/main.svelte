<script>
    const {log} = $props();
	let count = $state(0);

	function increment() {
		count += 1;
	}
	
	$effect.pre(() => {
		log.push(`Outer Effect Start (${count})`)

		$effect.pre(() => {
			log.push(`Inner Effect (${count})`)
		});

		log.push(`Outer Effect End (${count})`)
	});
</script>

<button on:click={increment}>
	Count: {count}
</button>