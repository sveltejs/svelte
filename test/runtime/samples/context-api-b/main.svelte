<script>
	import Nested from './Nested.svelte';
	import Leaf from './Leaf.svelte';
</script>

<Nested name='foo'>
	<Nested name='bar'>
		<Leaf/>
	</Nested>
	<Nested name='baz'>
		<Leaf/>
	</Nested>
</Nested>