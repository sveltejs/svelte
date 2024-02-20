<script>
	let {item, items, onclick} = $props()
</script>

<button {onclick}>
	{item.name} {items.includes(item)}
</button>
