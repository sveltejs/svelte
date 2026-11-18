<script>
	let { push } = $props();

	let data = await push('oops', true);
</script>

<p>{data}</p>
