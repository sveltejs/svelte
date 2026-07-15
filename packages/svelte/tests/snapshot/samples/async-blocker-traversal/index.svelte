<script>
	// Two separate top-level async groups produce two blocker indices.
	let first = await Promise.resolve('a'); // blocker $$promises[0]
	let second = await Promise.resolve('b'); // blocker $$promises[1]

	// A chain of plain assignments off `first`. Tracing `chain2` must follow the
	// whole chain back to `first` (blocker index 0).
	let chain0 = first;
	let chain1 = chain0;
	let chain2 = chain1;

	// An assignment cycle that also touches `second` (blocker index 1). Tracing
	// must terminate despite `p`/`q` referencing each other.
	let p, q;
	p = q;
	q = p;
	q = second;

	// `label` references `chain2` many times (each reference re-enters the shared
	// traversal) alongside `first` (a lower blocker index) and `q`. Its blocker must
	// be the max over every binding it reaches, so dropping any reached binding
	// during the shared traversal would change the emitted index.
	function label() {
		return `${first}-${chain2}${chain2}${chain2}${chain2}-${q}`;
	}

	// A function whose returned closure references a blocked binding: the returned
	// function is assumed callable, so the blocker must still propagate.
	function make() {
		return () => second;
	}

	// The `$effect` special case: the effect body is *not* traced, so referencing
	// `first` only inside an effect must not give `only_effect` a blocker.
	function only_effect() {
		$effect(() => {
			console.log(first);
		});
	}
</script>

<p>{label()}</p>
<p>{make()()}</p>
<button onclick={only_effect}>run</button>
