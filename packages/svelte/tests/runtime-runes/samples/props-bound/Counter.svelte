<script>
	let { count } = $props.bindable();
</script>

<button on:click={() => count++}>{count}</button>
