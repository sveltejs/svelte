<script>
	import Nested from './Nested.svelte';
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';
</script>

<Nested>
	Hello

	<Foo slot='foo' />
	<Bar slot='bar' />
</Nested>