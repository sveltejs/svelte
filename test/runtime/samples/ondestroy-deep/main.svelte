<script>
	import A from './A.svelte';

	export let visible = true;
</script>

{#if visible}
	<A/>
{/if}