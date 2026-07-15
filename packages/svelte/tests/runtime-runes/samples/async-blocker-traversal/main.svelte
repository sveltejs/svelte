<script>
	// Two top-level async groups.
	let first = await Promise.resolve('a');
	let second = await Promise.resolve('b');

	// Chained assignments off `first`.
	let chain0 = first;
	let chain1 = chain0;
	let chain2 = chain1;

	// An assignment cycle that also touches `second`. Tracing must terminate.
	let p, q;
	p = q;
	q = p;
	q = second;

	// References `chain2` repeatedly (shared-traversal path) plus `first` and `q`.
	function label() {
		return `${first}-${chain2}${chain2}${chain2}${chain2}-${q}`;
	}

	// Returned closure references a blocked binding.
	function make() {
		return () => second;
	}
</script>

<p>{label()}</p>
<p>{make()()}</p>
