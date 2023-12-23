<script>
    let a = $state("5");
    let b = $state("7");
    let c = $state("9");
    let d = $state("12");
    let e = $state(null);

    let f = Promise.resolve(() => "7");

    const update = async () => {
        // @ts-ignore
        [a = `${1}${await Promise.resolve(2)}`] = [];
        [b = "19" ? "19" : await Promise.resolve("20")] = [];
        ([c = "15"] = ([d = (await f)()] = ({ e = async (x) => await x } = [])));
    }
</script>

<button on:click={update}>Update me!</button>
<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>