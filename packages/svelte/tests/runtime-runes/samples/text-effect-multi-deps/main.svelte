<script>
	let x = $state({a: 0, b:0});
	let count = 0;
</script>

<p>{x.a} - {x.b}</p>

<button onclick={() => {
	const a = ++count;
	x = {a, b: a};
}}>+</button>

