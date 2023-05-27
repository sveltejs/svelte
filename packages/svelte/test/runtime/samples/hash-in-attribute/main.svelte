<script>
	export let links;
</script>

{#each links as link}
	<a href="x#{link}">x#{link}</a>
{/each}