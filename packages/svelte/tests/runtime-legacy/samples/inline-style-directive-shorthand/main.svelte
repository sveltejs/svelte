<script>
	export let color = "red";
</script>

<p style:color />

{#each [1] as _}
	<p style:color />
{/each}
