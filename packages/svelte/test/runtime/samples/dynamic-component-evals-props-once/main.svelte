<script>
  import Comp1 from './Comp1.svelte';
  import Comp2 from './Comp2.svelte';

  export let n = 0;
  let view = { comp: Comp1, fn: () => ++n };
</script>

<svelte:component this={view.comp} value={view.fn()}/>

<button on:click={e => view.comp = view.comp === Comp1 ? Comp2 : Comp1}>Toggle Component</button>

