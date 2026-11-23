<svelte:options customRenderer={null} />

<script>
	let count = $state(0);
</script>

<button onclick={() => (count += 1)}>{count}</button>
