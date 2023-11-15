<script>
	export let words;
</script>

{#each words as word (word)}
	<p>{word}</p>
{/each}
