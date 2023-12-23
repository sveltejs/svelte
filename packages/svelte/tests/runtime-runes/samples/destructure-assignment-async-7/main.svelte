<script>
    let a = $state(0);
    let b = $state(0);
    let c = $state(0);
    let d = $state(0);
    let e = $state(0);
    let f = $state(0);
    let g = $state(0);
    let h = $state(0);
    let i = $state(0);
    let j = $state(0);
    let k = $state(0);
    let l = $state(0);
    let m = $state(0);
    let n = $state(0);
    let o = $state(0);
    let p = $state(0);
    let q = $state(0);
    let r = $state(0);

    const update = async () => {
        [a, b] = [1, await Promise.resolve(2)];
        ({ c = await Promise.resolve(3), d } = { d: 4 });
        [e] = [await Promise.resolve(2) + await Promise.resolve(3)];
        ({ f = false || await Promise.resolve(6) } = {});
        let func = Promise.resolve(() => 7);
        [g = (await func)()] = [];
        let mult = (a, b) => (a * b);
        ({ h } = { h: mult(2, await Promise.resolve(4))});
        [i] = [new Date(await Promise.resolve(9)).getTime()];
        [j = "19" ? 10 : await Promise.resolve(11)] = [];
        let obj = ({ [await Promise.resolve("prop")]: k } = { prop: 11 });
        [l = obj[await Promise.resolve("prop")] + 1] = [];
        [m] = [`${1}${await Promise.resolve("3")}`];
        [n] = [-(await Promise.resolve(-14))];
        [o] = [(console.log(15), await Promise.resolve(15))];
        ({ anotherprop: p = await Promise.resolve(16) } = obj);
        let val;
        ({ val = (async (x) => await x)(Promise.resolve(17)), q = await val } = []);
        ({ val = (async function (x) { return await x; })(Promise.resolve(18)), r = await val } = []);
    }
</script>

<button on:click={update}>Update me!</button>
<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>
<p>{e}</p>
<p>{f}</p>
<p>{g}</p>
<p>{h}</p>
<p>{i}</p>
<p>{j}</p>
<p>{k}</p>
<p>{l}</p>
<p>{m}</p>
<p>{n}</p>
<p>{o}</p>
<p>{p}</p>
<p>{q}</p>
<p>{r}</p>