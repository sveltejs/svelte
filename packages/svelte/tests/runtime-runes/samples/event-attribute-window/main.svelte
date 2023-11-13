<script>
	let count = $state(0);
</script>

<svelte:window onclick={() => count++} />
<p>{count}</p>
