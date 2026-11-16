<script>
	// independent of each other, so they are created in parallel
	let a = $derived(await foo());
	let { b } = $derived(await bar());

	// reads `a` directly, so it has to wait for the previous group
	let c = $derived(await bar(a));

	// reads `c` indirectly via `get_c`, so it has to wait for `c`...
	let d = $derived(await get_c());

	// ...and this one is independent of `d`, so it's created in parallel with it
	let e = $derived(await foo());

	// a regular top-level `await` in between means it has to wait
	await baz();

	let f = $derived(await foo());

	function get_c() {
		return c;
	}
</script>

{a} {b} {c} {d} {e} {f}
