<script>
	let a = $state("0");
	let b = $state("0");
	let c = $state("0");
	let d = $state("0");

	function update() {
		// @ts-expect-error
		console.log(a++);
		// @ts-expect-error
		console.log(b--);
		// @ts-expect-error
		console.log(++c);
		// @ts-expect-error
		console.log(--d);
	}
</script>

<button onclick={update}>update</button>
<p>{a}, {b}, {c}, {d}</p>
