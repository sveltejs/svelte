<script>
    import Counter from './Counter.svelte';

    let bound = $state(0);
    let bound_nested = $state({count: 0});
    let unbound = $state(0);
</script>

<p>{bound} {bound_nested.count} {unbound}</p>

<Counter bind:count={bound} />
<Counter bind:count={bound_nested.count} />
<Counter count={unbound} />
