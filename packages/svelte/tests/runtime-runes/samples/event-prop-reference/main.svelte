<script>
	let { item } = $props();

	function onclick() {
		console.log(item?.name);
	}
</script>

<button {onclick}>
	{item?.name}
</button>
