<script>
	const { label = 0, size = 0 } = $props();

	const title = $derived(size.toString());
</script>

<p {title}>{label}</p>
