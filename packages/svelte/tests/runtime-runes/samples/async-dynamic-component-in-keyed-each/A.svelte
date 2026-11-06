<script>
	let { id, gate } = $props();
</script>

<span>a{await gate(id)}</span>
