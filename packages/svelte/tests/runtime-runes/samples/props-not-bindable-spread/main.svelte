<script>
    import Counter from './Counter.svelte';

    let count = $state(0);
</script>

<Counter bind:count />
