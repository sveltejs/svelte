<script>
    let a = $state(5);
    let b = $state(7);
    let c = $state(9);
    let d = $state(12);

    const update = async () => {
        [a, b, c, d] = [
            12,
            19,
            await new Promise((resolve) => setTimeout(() => resolve(15), 100)),
            7,
        ];
    }
</script>

<button on:click={update}>Update me!</button>
<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>