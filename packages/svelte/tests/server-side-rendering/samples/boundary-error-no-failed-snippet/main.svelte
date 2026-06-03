<script>
	function throws() {
		throw new Error('component error');
	}
</script>

<svelte:boundary onerror={() => {}}>
	<p>{throws()}</p>
</svelte:boundary>
