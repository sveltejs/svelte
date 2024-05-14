<script>
    let { children, named } = $props();
</script>

<p>{@render children()}</p>
{@render named({foo: 'foo'})}
