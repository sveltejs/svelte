<svelte:options customElement={{}} />

<script lang="ts">
	let { count = 0 } = $props();
</script>

<p>{typeof count}: {count}</p>
