<script lang="ts">
	let { ref = $bindable(null) } = $props();
</script>

<input bind:this={ref} />
