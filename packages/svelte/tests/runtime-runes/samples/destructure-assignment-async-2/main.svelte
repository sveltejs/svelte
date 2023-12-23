<script>
    let a = $state(5);
    let b = $state(7);
    let c = $state(9);
    let d = $state(12);

    const update = async () => {
        ({ a, b = (10 + await Promise.resolve(9)), c, d } = { a: 12, c: 15, d: 7 });
    }
</script>

<button on:click={update}>Update me!</button>
<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>