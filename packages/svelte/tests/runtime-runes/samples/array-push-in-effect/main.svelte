<script>
	let count = $state(0);
	let log = $state([]);

	$effect(() => {
		log.push(count);
	});

	function inc() {
		count += 1;
	}
</script>

<button on:click={inc}>inc</button>
{#each log as item}
	<p>{item}</p>
{/each} 