<script>
	export let animals;
	export let foo;
</script>

before
{#each animals as animal (animal)}
	<p>{animal}</p>
{:else}
	<p>no animals, but rather {foo}</p>
{/each}
after
