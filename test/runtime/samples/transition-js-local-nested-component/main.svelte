<script>
	export let x;

	import Widget from './Widget.svelte';
</script>

{#if x}
	<Widget/>
{/if}