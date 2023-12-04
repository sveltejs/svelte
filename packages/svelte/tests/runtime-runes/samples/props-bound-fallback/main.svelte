<script>
    import Counter from './Counter.svelte';

    let bound = $state();
</script>

<button on:click={() => bound = 1}>{bound}</button>

<Counter bind:count={bound} />
