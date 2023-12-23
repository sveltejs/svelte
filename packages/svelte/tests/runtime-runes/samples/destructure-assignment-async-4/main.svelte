<script>
    let a = $state(5);
    let b = $state(7);
    let c = $state(9);
    let d = $state(12);

		let n = 18;

    let z = $state(null);

    const update = async () => {
				({ a = (console.log(11), await Promise.resolve(12)) } = {});
				({ b } = { b: ++n });
        [c] = [15];
        ({ d } = { d: ((a, b) => a + b)(1, await Promise.resolve(6)) });
    }
</script>

<button on:click={update}>Update me!</button>
<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>
