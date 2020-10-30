<script>
    import Component from './Component.svelte';
    import Empty from './Empty.svelte';

    export let value = "init"
</script>

<Component>
    <div slot="named"><Empty/></div>
    <a href="___{value}">___{value}</a>
</Component>