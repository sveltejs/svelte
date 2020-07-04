<script>
    import { createEventDispatcher } from 'svelte';

    export let item

    const dispatch = createEventDispatcher()
</script>

<button on:click={() => dispatch('select', item)}>
    {item}
</button>