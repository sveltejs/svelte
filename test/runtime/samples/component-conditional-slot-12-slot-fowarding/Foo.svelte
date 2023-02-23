<script>
  import Bar from './Bar.svelte';
  export let condition1 = false;
  export let condition2 = true;
</script>

<Bar>
  <slot name="a" slot="x">Fallback a</slot>
  {#if condition1}
    <slot name="b" slot="y">Fallback b</slot>
  {/if}
  {#if condition2}
    <slot name="c" slot="z">Fallback c</slot>
  {/if}
</Bar>
