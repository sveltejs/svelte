<script>
  import Outer from './Outer.svelte'
  import Inner from './Inner.svelte'
  import Trigger from './Trigger.svelte'

  const data = $derived(await Promise.resolve(['a', 'b']))
  let trigger = $state()
</script>

<Outer>
  <Inner {@attach trigger?.action}>
    foo
  </Inner>
</Outer>

<Trigger bind:this={trigger} />
