<script>
	import Nested from './Nested.svelte';

	export let titles;
</script>

{#each titles as title (title.name)}
	<Nested title="{title.name}"/>
{/each}