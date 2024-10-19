<script>
    /**
     * @typedef {Object} Props
     * @property {any} foo
     */

    /** @type {Props & { [key: string]: any }} */
    let { foo, ...rest } = $props();
</script>

<button {foo} {...rest}>click me</button>