<script>
	import Widget from './Widget.svelte';

	export let x;
</script>

{#if x}
	<Widget/>
{/if}