<script>
  import Inner from './Inner.svelte'
  export let log;
  export let a;
	export let b;
</script>

<Inner {log} {b}>
  <svelte:fragment let:innerCall slot="inner_slot">
    <slot outerCall={() => innerCall(a)} />
  </svelte:fragment>
</Inner>