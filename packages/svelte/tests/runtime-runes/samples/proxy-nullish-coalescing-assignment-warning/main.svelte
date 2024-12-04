<script>
	let object = $state({ items: null });
</script>

<button onclick={() => (object.items ??= []).push(object.items.length)}>
	items: {JSON.stringify(object.items)}
</button>
