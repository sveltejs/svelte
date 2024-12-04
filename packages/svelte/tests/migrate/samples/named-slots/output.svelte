<script lang="ts">
  import Component from './Component.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<Component>
  {#snippet msg()}
    {@render children?.()}
  {/snippet}
</Component>