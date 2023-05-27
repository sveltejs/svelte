<script>
	import Top from './Top.svelte';

	export let top;
	export let visible = true;
</script>

{#if visible}
	<Top bind:this={top}></Top>
{/if}