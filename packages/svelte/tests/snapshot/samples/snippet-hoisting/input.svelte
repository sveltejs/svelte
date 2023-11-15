<script>
	function log() {
		console.log(snippet)
	}
</script>

{#snippet snippet()}Hello{/snippet}

<button on:click={log}>
	log snippet
</button>
