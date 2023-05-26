<script>
	export let array;
</script>

{#each array as { 0: first, '2': third, "length": length }}
	<p>First: {first}, Third: {third}, Length: {length}</p>
{/each}
