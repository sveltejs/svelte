<script>
	let items = $state(null);
</script>

<button onclick={() => (items ??= []).push(items.length)}>
	items: {JSON.stringify(items)}
</button>
