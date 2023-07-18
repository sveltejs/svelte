<script>
	export let letters;
</script>

{#each letters as letter (letter.id)}
  <div>{letter.char}</div>
{/each}