<script>
	import Nested from './Nested.svelte';

	export let list = [1, 2];
</script>

{#each list as nested}
	{#if true}
		<Nested {nested}/>
	{/if}
{/each}