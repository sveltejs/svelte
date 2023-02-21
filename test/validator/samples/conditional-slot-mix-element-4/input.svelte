<script>
	import Nested from './Nested.svelte';
	export let condition;
</script>

<Nested>
	<div>
    {#if condition}
      <svelte:fragment slot='xxx' />
    {/if}
  </div>
</Nested>