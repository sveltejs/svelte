<script lang="ts">
	let arr = [];
</script>

{#each arr as [key, value = 'default']}
	<div>{key}: {value}</div>
{/each}
