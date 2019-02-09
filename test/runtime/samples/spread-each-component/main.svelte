<script>
	import Nested from './Nested.svelte';

	export let things;
</script>

{#each things as thing}
	<Nested {...thing}/>
{/each}