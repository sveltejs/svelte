<script>
	// destructuring stuff on the server needs a bit more code
	// so that every identifier is a function
	let stuff = $state({ foo: true, bar: [1, 2, {baz: 'baz'}] });
	let { foo, bar: [a, b, { baz }]} = $derived(stuff);

	let stuff2 = $state([1, 2, 3]);
	let [d, e, f] = $derived(stuff2);

	let count = $state(0);
	let double = $derived(count * 2);
	let identifier = $derived(count);
	let dot_by = $derived(()=>count);

	class Test{
		state = $state(0);
		der = $derived(this.state * 2);
		der_by = $derived.by(()=>this.state);
		identifier = $derived(this.state);
	}

	const test = new Test();
</script>

{foo} {a} {b} {baz} {d} {e} {f} {double} {identifier} {dot_by} {test.der} {test.der_by} {test.identifier}