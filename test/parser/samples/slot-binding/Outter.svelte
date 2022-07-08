<script>
  import Inner from './Inner.svelte'
</script>

<Inner>
  <svelte:fragment let:innerCall slot="inner_slot">
    <slot outerCall={() => innerCall()} />
  </svelte:fragment>
</Inner>