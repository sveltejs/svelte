<script>
	export let foo;

	import Widget from './Widget.svelte';
</script>

{#if foo}
	<Widget/>
{/if}