<script>
  let stuff = $state({ foo: true, bar: [1, 2, {baz: 'baz'}] });
  let { foo, bar: [a, b, { baz }]} = $derived(stuff);
</script>

{foo} {a} {b} {baz}
