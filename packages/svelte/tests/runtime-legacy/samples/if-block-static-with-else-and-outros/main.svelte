<script>
	import EEE from './EEE.svelte';
	import RRR from './RRR.svelte';
</script>

{#if "Eva".startsWith('E')}
	<EEE/>
{:else}
	<RRR/>
{/if}