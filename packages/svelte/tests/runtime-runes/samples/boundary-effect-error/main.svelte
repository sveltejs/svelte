<script>
  import Test from './Test.svelte';
</script>

<svelte:boundary>
  <Test />

  {#snippet failed(e)}
    <p>caught: {e.message}</p>
  {/snippet}
</svelte:boundary>
