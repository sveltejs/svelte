<script>
	import Widget from './Widget.svelte';

	export let foo = false;
	export let q;
</script>

{#if foo}
	<Widget p='{q}'/>
{/if}