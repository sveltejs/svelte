<script>
	let hidden = $state(true);

	const restProps = {
		id: '123'
	}
</script>

<button onclick={() => hidden = !hidden}>
	toggle hidden
</button>

<div {...restProps} hidden={hidden}>
	hello world (with spread attrs)
</div>
