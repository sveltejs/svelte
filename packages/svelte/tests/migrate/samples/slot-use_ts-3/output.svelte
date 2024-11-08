<script>
    
    /**
     * @typedef {Object} Props
     * @property {ShouldNotUseTSBecauseImUsingJsDoc} data
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { data, children } = $props();
</script>

{@render children?.()}