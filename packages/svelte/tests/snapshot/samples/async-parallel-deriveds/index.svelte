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

	// a regular top-level `await` can't be skipped, so this has to wait
	await baz();

	let f = $derived(await foo());

	// reads `items`, which `g`'s expression might modify, so `g` can't be created before it
	let count = items.length;
	let g = $derived(await fill(items));

	function get_c() {
		return c;
	}
</script>

{a} {b} {c} {d} {e} {f} {count} {g}
