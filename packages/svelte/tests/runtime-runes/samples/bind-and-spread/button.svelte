<script>
	let { value = $bindable(), ...properties } = $props();
</script>

<button {...properties} onclick={() => value++}>{value}</button>
