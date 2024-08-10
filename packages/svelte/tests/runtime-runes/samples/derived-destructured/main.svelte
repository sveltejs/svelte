<script>
  let stuff = $state({ foo: true, bar: [1, 2, {baz: 'baz'}] });
  let { foo, bar: [a, b, { baz }]} = $derived(stuff);

	let stuff2 = $state([1, 2, 3]);
	let [d, e, f] = $derived(stuff2);
</script>

{foo} {a} {b} {baz} {d} {e} {f}