<script>
    import Component from './component.svelte';
</script>
<Component let:data>
    {@const thing = data}
    {thing}
</Component>