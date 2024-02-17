<script>
    import Counter from './Counter.svelte';

    let bound = $state(0);
    let bound_nested = $state({count: 0});
    let unbound = $state(0);
    let unbound_nested = $state({count: 0});
</script>

<p>{bound} {bound_nested.count} {unbound} {unbound_nested.count}</p>

<Counter bind:count={bound} />
<Counter bind:count={bound_nested.count} />
<Counter count={unbound} />
<Counter count={unbound_nested.count} />
