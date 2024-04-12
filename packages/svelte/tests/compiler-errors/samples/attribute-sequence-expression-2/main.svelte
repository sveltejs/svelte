<script>
	let { x, y, z } = $props();
</script>

<!-- allowed -->
<span foo={(x, y, z)} />

<!-- not allowed -->
<span foo={x, y, z} />
