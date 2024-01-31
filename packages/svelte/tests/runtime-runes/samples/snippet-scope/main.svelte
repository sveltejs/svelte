<script>
	import Component from './Component.svelte';
	let name = "Svelte";
</script>

{#each name.split('') as character}
	<p>{character}</p>
	<Component>
		{#snippet inner()}
			<a href={'#'}>{character}</a>
		{/snippet}
	</Component>
{/each}
