<script>
	let rows = $state([5, 6]);
</script>

{#each rows as __proto__}
	<span>{__proto__}</span>
{/each}
