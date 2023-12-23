<script>
    let a = $state(5);
    let b = $state(7);
    let c = $state(9);
    let d = $state(12);

    let z = {
        a: Promise.resolve(12),
        b: Promise.resolve(-19),
        c: Promise.resolve(0),
        d: Promise.resolve(7),
    }

    const update = async () => {
        [a = await z.a] = [];
        [b = -(await z.b)] = [];
        [c, ...{ d = function () {} && (await z.c || await z.d) }] = [15];
    }
</script>

<button on:click={update}>Update me!</button>
<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>