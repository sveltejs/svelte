<script>
	const { environment } = $props();

	if (environment === 'client') {
		throw new Error('oops');
	}
</script>
