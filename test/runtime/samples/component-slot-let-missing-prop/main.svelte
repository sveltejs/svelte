<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	const things = { '1': 'one' };
</script>

<Foo let:id>
	<Bar thing={things[id]}/>
</Foo>