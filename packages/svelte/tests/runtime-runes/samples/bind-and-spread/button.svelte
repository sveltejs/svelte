<script>
	let { value: _, ...properties } = $props();
	let { value } = $props.bindable();
</script>

<button {...properties} onclick={() => value++}>{value}</button>
