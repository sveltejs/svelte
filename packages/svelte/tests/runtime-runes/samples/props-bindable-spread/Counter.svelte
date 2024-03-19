<script>
	let { ...rest } = $props.bindable();
</script>

<button on:click={() => rest.count++}>{rest.count}</button>
