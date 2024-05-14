<script>
    import { onMount, mount } from 'svelte';

    let el;

    onMount(() => {
        mount(foo, { target: el });
    });
</script>

<div bind:this={el}></div>
{#snippet foo()}
    shouldnt be rendered
{/snippet}