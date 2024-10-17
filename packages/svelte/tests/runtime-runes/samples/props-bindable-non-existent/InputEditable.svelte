<script>
	let {
		value = $bindable(),
		content = $bindable(),
	} = $props()
</script>
<div bind:innerText={content} contenteditable>
</div>
<input type="text" bind:value />
