<script>
    let { children, ...rest } = $props();
</script>

<div {...rest}>child2:{@render children?.()}</div>