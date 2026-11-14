<script>
	let { push } = $props();
</script>

<p>q: {await push('q', 0)}</p>
