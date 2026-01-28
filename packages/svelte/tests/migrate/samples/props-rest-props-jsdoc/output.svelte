<script>
    
    /**
     * @typedef {Object} Props
     * @property {string} foo
     */

    /** @type {Props & { [key: string]: any }} */
    let { foo, ...rest } = $props();
</script>

<button {foo} {...rest}>click me</button>