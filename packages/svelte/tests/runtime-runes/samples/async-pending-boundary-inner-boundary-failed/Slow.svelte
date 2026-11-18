<script>
	let { push } = $props();
</script>

<p>{await push('slow')}</p>
