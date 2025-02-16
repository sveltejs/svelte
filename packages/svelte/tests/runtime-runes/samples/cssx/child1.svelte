<script>
    let { children, style } = $props();
</script>

<div {style}>child1:{@render children?.()}</div>
