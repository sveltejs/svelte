<svelte:options runes={false} />
<script>
	export let prop;
    let count_1 = prop.count;
	$: {
        count_1 = prop.count;
    }
    $: count_2 = prop.count;
</script>

<p>{count_1} / {count_2}</p>
