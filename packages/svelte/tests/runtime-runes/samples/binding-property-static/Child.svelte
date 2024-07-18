<script lang="ts">
	let { value = $bindable() }: { value: number } = $props();
</script>

<p>{value}</p>
