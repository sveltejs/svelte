<script>
	const items = [];

	// independent of each other, so they are created in parallel
	let a = $derived(await foo());
	let { b } = $derived(await bar());

	// reads `a` directly, so it is created once `a` has resolved, in parallel with `b`
	let c = $derived(await bar(a));

	// reads `c` indirectly via `get_c`, so it has to wait for `c`...
	let d = $derived(await get_c());

	// ...whereas this one is independent of everything before it, so it's created right away
	let e = $derived(await foo());

	// a regular top-level `await` doesn't hold up async deriveds that don't depend on it...
	let config = await baz();
	let f = $derived(await foo());

	// ...but this one reads `config`, so it has to wait for it
	let g = $derived(await foo(config));

	// `setup` visibly writes `items`, which `h` reads, so `h` has to wait for it
	setup();
	let h = $derived(await foo(items));

	function setup() {
		items.push(1);
	}

	function get_c() {
		return c;
	}
</script>

{a} {b} {c} {d} {e} {f} {g} {h}
