<script>
	import RRR from './RRR.svelte';

	export let x;
</script>

{#if "Eva".startsWith('E')}
	eee
{:else if x}
  def
{:else}
	<RRR/>
{/if}
