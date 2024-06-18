<script>
	const { browser } = $props();
	let value = browser ? 'browser' : 'server';
</script>

<input type="text" {value} />
