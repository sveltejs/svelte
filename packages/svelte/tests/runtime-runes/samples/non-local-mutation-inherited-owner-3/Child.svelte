<script>
	let { item } = $props();

	function onclick() {
		item.name = `${item.name} edited`
	}
</script>

<div>{item?.name}</div>
<button {onclick}>Then click here</button>
