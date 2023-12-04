<script lang="ts">
	let letters = ['a', 'b', 'c'];
</script>

{#each letters as letter: string, i}
	<span>{i}: {letter}</span>
{/each}
