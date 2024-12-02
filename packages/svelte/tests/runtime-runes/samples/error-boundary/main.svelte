<script>
	function throw_error() {
		throw new Error('test')
	}
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	{throw_error()}
</svelte:boundary>


