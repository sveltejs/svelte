<script>
	export let characters;
</script>

{#each characters as char}
	<span>{char} </span>
{/each}