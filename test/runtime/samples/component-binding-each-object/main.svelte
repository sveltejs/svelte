<script>
	import Widget from './Widget.svelte';

	export let a;
</script>

{#each a as x}
	<Widget bind:value={x}/>
{/each}