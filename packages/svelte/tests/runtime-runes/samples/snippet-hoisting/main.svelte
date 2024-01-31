<script>
	function log() {
		// Test that the log function is not hoisted. If it was, this would make the test
		// pass still, but Vitest would error because it sees that there are unhandled errors
		snippet;
	}
</script>

{#snippet snippet()}Hello{/snippet}

<button on:click={log}>
	log snippet
</button>
