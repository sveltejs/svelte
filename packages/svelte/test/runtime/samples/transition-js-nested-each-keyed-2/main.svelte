<script>
	export let x;
	export let things;

	import Widget from './Widget.svelte';
</script>

{#if x}
	<Widget {things}/>
{/if}