<script>
	export let array;
</script>

{#each array as { 0: first, length, [length - 1]: last, [Math.floor(length / 2)]: half }}
	<p>First: {first}, Half: {half}, Last: {last}, Length: {length}</p>
{/each}
