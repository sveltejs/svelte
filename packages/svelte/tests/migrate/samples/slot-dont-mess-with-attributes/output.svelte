<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<MyComponent
  variant="outlined"
>
  {@render children?.()}
</MyComponent>