<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:data={{ foo: fooRenamed, bar: { baz: bazRenamed } }}>
	<p>{fooRenamed}</p>
	<p>{bazRenamed}</p>
</Nested>
