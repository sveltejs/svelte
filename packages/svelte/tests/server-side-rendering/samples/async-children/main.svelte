<script>
    import Component from "./component.svelte";
</script>
<Component>
    {@const one = await 1}
    {one}
</Component>