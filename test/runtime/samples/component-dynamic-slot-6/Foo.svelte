<script>
  import Bar from './Bar.svelte'
</script>

<Bar>
  {#if $$slots.top}
    <svelte:fragment slot="top"><slot name="top" /></svelte:fragment>
  {/if}
  <svelte:fragment slot="middle"><slot name="middle">Middle</slot></svelte:fragment>
  {#if $$slots.bottom}
    <svelte:fragment slot="bottom"><slot name="bottom" /></svelte:fragment>
  {/if}
</Bar>
