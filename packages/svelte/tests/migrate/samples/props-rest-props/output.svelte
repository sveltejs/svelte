<script>
    /** @type {{Record<string, any>}} */
    let { foo, ...rest } = $props();
</script>

<button {foo} {...rest}>click me</button>