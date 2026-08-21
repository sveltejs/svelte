<script>
	const symbol1 = Symbol();
	const symbol2 = Symbol();

	let a = { [symbol1]: 42 };
	Object.defineProperty(a, symbol2, { enumerable: false, value: "nope" })

	let { ...b } = $derived(a);
</script>

<p>{symbol1 in b} {symbol2 in b}</p>
