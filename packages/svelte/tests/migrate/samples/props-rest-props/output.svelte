<script>
    /** @type {{foo: any, [key: string]: any}} */
    let { foo, ...rest } = $props();
</script>

<button {foo} {...rest}>click me</button>