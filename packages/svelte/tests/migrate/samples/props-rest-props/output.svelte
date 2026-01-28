<script>
    let { foo, ...rest } = $props();
</script>

<button {foo} {...rest}>click me</button>