<script>
	let a = $state(0);
	let b = $state("b");
	let c = $state(true);
	let d = $state([]);
	let e = $state({ x: 10, y: 12 });
	let f = $state({ w: 15, v: 16 });

	function change() {
		({ d, e, g: [f.w, f.v] } = { d: ([a, b, c] = [5, "d", false]), e: { x: 100, y: 120 }, g: [25, 26] });
	}
</script>

<button on:click={change}>Update</button>

<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d.length}</p>
<p>{e.x}</p>
<p>{e.y}</p>
<p>{f.w}</p>
<p>{f.v}</p>
