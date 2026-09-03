<script>
	let { id, gate } = $props();
</script>

<span>b{await gate(id)}</span>
