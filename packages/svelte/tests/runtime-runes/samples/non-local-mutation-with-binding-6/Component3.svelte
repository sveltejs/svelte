<script lang="ts">
	let { count = $bindable() } = $props();
</script>

<button onclick={() => count.value++}>{count.value}</button>
