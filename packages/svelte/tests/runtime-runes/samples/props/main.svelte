<script>
    const { foo, default1 = 1, default2 = 2, default3 = 3, ...others } = $props();
</script>

{foo} {default1} {default2} {default3} {others.bar}