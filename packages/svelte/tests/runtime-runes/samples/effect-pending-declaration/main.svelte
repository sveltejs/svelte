<script>
	function status() {
		const pending = $effect.pending();
		return pending === 0 ? 'idle' : 'busy';
	}
</script>

<p>{status()}</p>
