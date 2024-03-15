<script>
	let { count: definedCount } = $props.bindable();
</script>

<button on:click={() => definedCount++}>{definedCount}</button>
