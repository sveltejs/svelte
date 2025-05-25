<script>
	let { a, b, c } = $derived({});
	let [d, e, f] = $derived([]);
	let { g, h, i: [j] } = $derived([]);
	let { k, l, m: { n: [o] } } = $derived([]);
</script>

